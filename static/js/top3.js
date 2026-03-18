
	
	async function top3Toiminnot(id) {
		const vastaus = await fetch(`/hae_top3?id=${id}`);
		const data = await vastaus.json();

		let t1 = "", t2 = "", t3 = "", l = "";

		if (data.found) {
			t1 = data.top_1;
			t2 = data.top_2;
			t3 = data.top_3;
			l = data.lisatiedot || "";
		}

		avaaModal(`
			<h3>Top 3 taidot</h3>
			<input type="hidden" id="top3_henkilo_id" value="${id}">

			Top 1<br><input id="top1" value="${t1}"><br>
			Top 2<br><input id="top2" value="${t2}"><br>
			Top 3<br><input id="top3" value="${t3}"><br>
			Lisätiedot<br>
			<textarea id="top3_lisatiedot" rows="5">${l}</textarea><br><br>

			<button onclick="tallennaTop3()">Tallenna</button>
    `	);
	}
	
	async function tallennaTop3() {
		const data = {
			id: document.getElementById("top3_henkilo_id").value,
			top_1: document.getElementById("top1").value,
			top_2: document.getElementById("top2").value,
			top_3: document.getElementById("top3").value,
			lisatiedot: document.getElementById("top3_lisatiedot").value
		};

		const vastaus = await fetch("/tallenna_top3", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data)
		});

		const tulos = await vastaus.json();

		if (tulos.status === "ok") {
			alert("Top 3 -tiedot tallennettu");
			suljeModal();
		}
	}
	
	
	