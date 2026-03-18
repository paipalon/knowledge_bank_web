

	function onkoKelvollinenEmail(email) {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
	}

	async function tallenna() {
		console.log("henkilo_id elementit:", document.querySelectorAll("#henkilo_id"));
		const id = document.getElementById("henkilo_id").value;
		console.log("ID:", id);

		const data = {
			etunimi: document.getElementById("etunimi").value,
			sukunimi: document.getElementById("sukunimi").value,
			sposti: document.getElementById("sposti").value,
			li_sivu: document.getElementById("li_sivu").value
		};
			
		if (!data.etunimi.trim()) {
			alert("Etunimi on pakollinen");
			return;
		}
			
		if (!data.sukunimi.trim()) {
			alert("Sukunimi on pakollinen");
			return;
		}
			
		if (!data.sposti.trim()) {
			alert("Sähköposti on pakollinen");
			return;
		}
			
		if (!onkoKelvollinenEmail(data.sposti)) {
			alert("Sähköpostiosoite ei ole kelvollinen");
			return;
		}

		let url = "/lisaa_henkilo";
		let method = "POST";
			
		// jos id löytyy → käytetään update-reittiä
		if (id) {
			url = "/paivita_henkilo";
			data.id = id;
		}
			
		const vastaus = await fetch(url, {
			method: method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data)
		});

		const tulos = await vastaus.json();
			
		if (tulos.status === "ok") {
		
			suljeModal();
			haeHenkilot(1);
		}
	}

	async function poistaHenkilo(id) {
		if (!confirm("Poistetaanko henkilö varmasti?")) {
			return;
		}

		const vastaus = await fetch("/poista_henkilo", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id: id })
		});

		const tulos = await vastaus.json();

		if (tulos.status === "ok") {
			alert("Henkilö poistettu");
			haeHenkilot(1);  // päivitetään lista
		} else {
			alert("Poisto epäonnistui");
		}
	}
	
	async function muokkaaHenkiloa(id) {

		const vastaus = await fetch(`/hae_henkilo?id=${id}`);
		const h = await vastaus.json();
		
		console.log(h);

		avaaHenkiloLomake(h);
	}

	