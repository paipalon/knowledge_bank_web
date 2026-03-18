	let nykyisetTaidot = [];
	let aktiivinenHenkiloId = null;
			
	async function haeTaidot(henkiloId) {
		const vastaus = await fetch(`/hae_taidot/${henkiloId}`);
		const data = await vastaus.json();
		
		nykyisetTaidot = data;

		const lista = document.getElementById("taitoLista");
		lista.innerHTML = "";

		if (data.length === 0) {
			lista.innerHTML = "<li>Ei taitoja</li>";
			return;
		}

		data.forEach(taito => {
			const li = document.createElement("li");
			li.innerHTML = `
				${taito.taito}
				<button onclick="poistaTaito(${taito.id})">Poista</button>
        `	;
			lista.appendChild(li);
		});
	}
	
	function suljeTaitoIkkuna() {
		document.getElementById("taitoOverlay").style.display = "none";
	}
	
	function lisaaTaito() {

		if (!aktiivinenHenkiloId) {
			alert("Henkilö ei ole valittuna");
			return;
		}

		const taito = document.getElementById("uusiTaito").value.trim();

		if (!taito) {
			alert("Anna taito");
			return;
		}
		
		const olemassa = nykyisetTaidot.some(
			t => t.taito.toLowerCase() === taito.toLowerCase()
		);
			
		if (olemassa) {
			alert("Taito on jo lisätty tälle henkilölle");
			return;
		}

		fetch("/lisaa_taito", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				henkilo_id: aktiivinenHenkiloId,
				taito: taito
			})
		})
		.then(r => r.json())
		.then(data => {
			if (data.status === "ok") {
					document.getElementById("uusiTaito").value = "";
            haeTaidot(aktiivinenHenkiloId);
			} else {
				alert("Virhe tallennuksessa");
			}
		});
	}
	
	function avaaTaidot(henkiloId) {
		
		aktiivinenHenkiloId = henkiloId;
		document.getElementById("taitoOverlay").style.display = "block";
		haeTaidot(henkiloId);
		
	}
	
	function avaaTaitoHaku() {
		const el = document.getElementById("taitoHakuOverlay");
		el.style.display = "block";

	}
	
	function suljeTaitoHaku() {
		document.getElementById("taitoHakuOverlay").style.display = "none";
	}
	
