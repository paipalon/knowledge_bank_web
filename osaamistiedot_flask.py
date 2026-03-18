from flask import Flask, render_template, request, jsonify
import sqlite3
import os
from db import init_db
print("TYÖHAKEMISTO:", os.getcwd())

app = Flask(__name__)

init_db()

@app.route("/")
def index():
    return render_template("Osaamistiedot.html")

@app.route("/hae_henkilot", methods=["GET"])
def hae_henkilot():
    tyyppi = request.args.get("tyyppi", type=int, default=1)
    nimi = request.args.get("nimi", "")
    
    conn = sqlite3.connect("osaamiset.db")
    conn.row_factory = sqlite3.Row  # mahdollistaa dict-tyyppisen tuloksen
    cursor = conn.cursor()

    if tyyppi == 1:
        cursor.execute("""
            SELECT id, etunimi, sukunimi, sposti, li_sivu
            FROM henkilot
            ORDER BY sukunimi
            """)

    elif tyyppi == 2:
         cursor.execute("""
            SELECT id, etunimi, sukunimi, sposti, li_sivu
            FROM henkilot
            WHERE etunimi LIKE ?
            ORDER BY sukunimi
            """, (f"%{nimi}%",))

    elif tyyppi == 3:
        cursor.execute("""
            SELECT id, etunimi, sukunimi, sposti, li_sivu
            FROM henkilot
            WHERE sukunimi LIKE ?
            ORDER BY sukunimi
            """, (f"%{nimi}%",))

    elif tyyppi == 4:
        taito = request.args.get("taito", "")

        cursor.execute("""
            SELECT DISTINCT h.id, h.etunimi, h.sukunimi, h.sposti, h.li_sivu
            FROM henkilot h
            JOIN taidot t ON t.id = h.id
            WHERE t.taito LIKE ?
            ORDER BY h.sukunimi
            """, (f"%{taito}%",))

    rivit = cursor.fetchall()
    conn.close()

    # muunnetaan listaksi sanakirjoja
    return jsonify([dict(r) for r in rivit])

@app.route("/hae_henkilo", methods=["GET"])
def hae_henkilo():
    print("Tultiin funktioon hae henkilö")
    id = request.args.get("id")
    conn = sqlite3.connect("osaamiset.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM henkilot WHERE id = ?", (id,))
    rivi = cursor.fetchone()
    conn.close()

    print("Suoritettiin funktio hae henkilö")

    return jsonify(dict(rivi))

@app.route("/lisaa_henkilo", methods=["POST"])
def lisaa_henkilo():
    data = request.get_json()

    en = data.get("etunimi")
    sn = data.get("sukunimi")
    sp = data.get("sposti")
    li = data.get("li_sivu")

    conn =sqlite3.connect("osaamiset.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO henkilot (etunimi, sukunimi, sposti, li_sivu) VALUES (?, ?, ?, ?)",
        (en, sn, sp, li)
    )
    conn.commit()
    conn.close()

    return jsonify({"status": "ok"})

@app.route("/poista_henkilo", methods=["POST"])
def poista_henkilo():
    data = request.get_json()
    henkilo_id = data.get("id")

    conn = sqlite3.connect("osaamiset.db")
    cursor = conn.cursor()

    cursor.execute("DELETE FROM taidot WHERE id = ?", (henkilo_id,))
    cursor.execute("DELETE FROM top3 WHERE id = ?", (henkilo_id,))
    cursor.execute("DELETE FROM henkilot WHERE id = ?", (henkilo_id,))
    conn.commit()
    conn.close()

    return jsonify({"status": "ok"})

@app.route("/paivita_henkilo", methods=["POST"])
def paivita_henkilo():
    print("Tultiin funktioon paivita_henkilo")
    data = request.get_json()

    conn = sqlite3.connect("osaamiset.db")
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE henkilot
           SET etunimi=?, sukunimi=?, sposti=?, li_sivu=?
           WHERE id=?""",
        (data["etunimi"], data["sukunimi"], data["sposti"], data["li_sivu"], data["id"])
    )
    conn.commit()
    conn.close()

    return jsonify({"status": "ok"})

@app.route("/hae_top3", methods=["GET"])
def hae_top3():
    conn = sqlite3.connect("osaamiset.db")
    conn.row_factory = sqlite3.Row  # mahdollistaa dict-tyyppisen tuloksen
    cursor = conn.cursor()
    id = request.args.get("id", None)
    
    cursor.execute(
        "SELECT top_1, top_2, top_3, lisatiedot FROM top3 WHERE id = ?",
        (id,)
    )

    rivi = cursor.fetchone()
    conn.close()

    if rivi is None:
        return jsonify({"found": False})

    return jsonify({
        "found": True,
        "top_1": rivi["top_1"],
        "top_2": rivi["top_2"],
        "top_3": rivi["top_3"],
        "lisatiedot": rivi["lisatiedot"]
    })

@app.route("/tallenna_top3", methods=["POST"])
def tallenna_top3():
    data = request.get_json()

    conn = sqlite3.connect("osaamiset.db")
    cursor = conn.cursor()

    # onko jo olemassa?
    cursor.execute("SELECT id FROM top3 WHERE id = ?", (data["id"],))
    olemassa = cursor.fetchone()

    if olemassa:
        cursor.execute(
            """UPDATE top3
               SET top_1=?, top_2=?, top_3=?, lisatiedot=?
               WHERE id=?""",
            (data["top_1"], data["top_2"], data["top_3"], data["lisatiedot"], data["id"])
        )
    else:
        cursor.execute(
            """INSERT INTO top3 (id, top_1, top_2, top_3, lisatiedot)
               VALUES (?, ?, ?, ?, ?)""",
            (data["id"], data["top_1"], data["top_2"], data["top_3"], data["lisatiedot"])
        )

    conn.commit()
    conn.close()

    return jsonify({"status": "ok"})

@app.route("/hae_taidot/<int:henkilo_id>")
def hae_taidot(henkilo_id):
    conn = sqlite3.connect("osaamiset.db")
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute(
        "SELECT id, taito FROM taidot WHERE id = ? ORDER BY taito",
        (henkilo_id,)
    )

    rivit = cur.fetchall()
    conn.close()

    return jsonify([dict(r) for r in rivit])

@app.route("/lisaa_taito", methods=["POST"])
def lisaa_taito():
    data = request.get_json()
    henkilo_id = data.get("henkilo_id")
    taito = data.get("taito")

    conn = sqlite3.connect("osaamiset.db")
    cur = conn.cursor()

    cur.execute(
    "SELECT 1 FROM taidot WHERE id = ? AND LOWER(taito) = LOWER(?)",
    (henkilo_id, taito)
    )

    if cur.fetchone():
        return jsonify({"status": "duplikaatti"}), 400

    cur.execute(
        "INSERT INTO taidot (id, taito) VALUES (?, ?)",
        (henkilo_id, taito)
    )

    conn.commit()
    conn.close()

    return jsonify({"status": "ok"})

@app.route("/muokkaa_taitoa", methods=["POST"])
def muokkaa_taitoa():
    data = request.get_json()
    id = data.get("id")
    uusi_taito = data.get("taito")

    conn = sqlite3.connect("osaamiset.db")
    cur = conn.cursor()

    cur.execute(
        "UPDATE taidot SET taito = ? WHERE id = ?",
        (uusi_taito, id)
    )

    conn.commit()
    conn.close()

    return jsonify({"status": "ok"})

@app.route("/hae_henkilot_taidolla/<taito>")
def hae_henkilot_taidolla(taito):
    console.log("Haetaan henkilöt taidolla!")
    conn = sqlite3.connect("osaamiset.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT DISTINCT h.id, h.etunimi, h.sukunimi, h.sposti, h.li_sivu
        FROM henkilot h
        JOIN taidot t ON h.id = t.id
        WHERE t.taito LIKE ?
        ORDER BY h.sukunimi
    """, (f"%{taito}%",))

    rivit = cursor.fetchall()
    conn.close()

    return jsonify([dict(r) for r in rivit])


if __name__ == "__main__":
    app.run(debug=True)




