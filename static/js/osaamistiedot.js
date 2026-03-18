	"use strict";
	
	document.addEventListener("DOMContentLoaded", function() {
		
		haeHenkilot(1);
			
			
	});
			
			
	async function haeHenkilot(tyyppi) {
		let url = "/hae_henkilot";

		if (tyyppi === 2 || tyyppi === 3) {
			const nimi = document.getElementById("hakukentta").value.trim();
			url += `?tyyppi=${tyyppi}&nimi=${encodeURIComponent(nimi)}`;
		}
		else if (tyyppi === 4) {
			const taito = document.getElementById("taitoHakuKentta").value.trim();

			if (!taito) {
				alert("Anna taito");
				return;
			}

        url += `?tyyppi=4&taito=${encodeURIComponent(taito)}`;
		}

		try {
			const vastaus = await fetch(url);

			if (!vastaus.ok) {
				throw new Error("Palvelinvirhe");
			}

			const data = await vastaus.json();
			naytaHenkiloLista(data);

		} catch (virhe) {
			alert("Tietojen haku epäonnistui");
			console.error(virhe);
		}
	}
	
	function avaaModal(html) {
		document.getElementById("modalSisalto").innerHTML = html;
		document.getElementById("modalTausta").style.display = "block";
	}
	
	function suljeModal() {
		document.getElementById("modalTausta").style.display = "none";
	} 
	
	function avaaHenkiloLomake(h = null) {

		avaaModal(`
			<h3>Henkilön tiedot</h3>

			<input type="hidden" id="henkilo_id" value="${h ? h.id : ""}">

			Etunimi<br>
			<input id="etunimi" value="${h ? h.etunimi : ""}"><br>

			Sukunimi<br>
			<input id="sukunimi" value="${h ? h.sukunimi : ""}"><br>

			Sähköposti<br>
			<input id="sposti" value="${h ? h.sposti : ""}"><br>

			LinkedIn<br>
			<input id="li_sivu" value="${h ? h.li_sivu : ""}"><br><br>

			<button onclick="tallenna()">Tallenna</button>
		`);
	}
	
	function luoHenkiloHTML(h) {
		return `
			<div class="henkilo-teksti">
				<div><strong>${h.etunimi} ${h.sukunimi}</strong></div>
				<div>${h.sposti}</div>
				${h.li_sivu ? `<div>${h.li_sivu}</div>` : ""}
			</div>

			<div class="henkilo-napit">
				<button onclick="muokkaaHenkiloa(${h.id})">Muokkaa</button>
				<button onclick="poistaHenkilo(${h.id})">Poista</button>
				<button onclick="top3Toiminnot(${h.id})">Top 3</button>
				<button onclick="avaaTaidot(${h.id})">Taidot</button>
			</div>
		`;
	}
	
	function naytaHenkiloLista(data) {

		const tulosLista = document.getElementById("tulokset");
		tulosLista.innerHTML = "";

		if (data.length === 0) {
			tulosLista.innerHTML = "<li>Ei tuloksia</li>";
			document.getElementById("maara").value = 0;
			return;
		}

		data.forEach(henkilo => {
			const li = document.createElement("li");
			li.innerHTML = luoHenkiloHTML(henkilo);
			tulosLista.appendChild(li);
		});

		document.getElementById("maara").value = data.length;
	}
		
