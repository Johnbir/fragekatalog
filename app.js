(function () {
  const KEY = "fk_answers_v1";
  const $ = (s) => document.querySelector(s);
  let answers = {};
  try { answers = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(answers)); } catch (e) {} };

  const steps = [{ kind: "intro" }, ...SECTIONS.map((s) => ({ kind: "section", s })), { kind: "final" }];
  let cur = 0;
  $("#title").textContent = TITLE;

  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function renderQuestion(it) {
    const v = answers[it.id];
    let h = `<div class="q"><div class="label">${esc(it.q)}</div>`;
    if (it.hint) h += `<div class="hint">${esc(it.hint)}</div>`;
    if (it.type === "text") {
      h += `<textarea data-id="${it.id}">${esc(v || "")}</textarea>`;
    } else if (it.type === "scale") {
      h += `<div class="scale"><span class="end">1 = ${esc(it.low || "")}</span>`;
      for (let i = 1; i <= 5; i++) h += `<label class="opt"><input type="radio" name="${it.id}" value="${i}" ${v == i ? "checked" : ""}>${i}</label>`;
      h += `<span class="end">5 = ${esc(it.high || "")}</span></div>`;
    } else if (it.type === "single") {
      h += `<div class="opts">` + it.options.map((o) => `<label class="opt"><input type="radio" name="${it.id}" value="${esc(o)}" ${v === o ? "checked" : ""}>${esc(o)}</label>`).join("") + `</div>`;
    } else if (it.type === "multi") {
      const arr = v || [];
      h += `<div class="opts">` + it.options.map((o) => `<label class="opt"><input type="checkbox" data-multi="${it.id}" value="${esc(o)}" ${arr.includes(o) ? "checked" : ""}>${esc(o)}</label>`).join("") + `</div>`;
    } else if (it.type === "matrix" || it.type === "matrixscale") {
      const cols = it.type === "matrix" ? it.cols : [1, 2, 3, 4, 5];
      const m = v || {};
      h += `<div style="overflow-x:auto"><table class="matrix"><tr><th></th>${cols.map((c) => `<th>${c}</th>`).join("")}</tr>`;
      it.rows.forEach((r, i) => {
        h += `<tr><td>${esc(r)}</td>` + cols.map((c) => `<td><input type="radio" name="${it.id}__${i}" data-matrix="${it.id}" data-row="${esc(r)}" value="${c}" ${String(m[r]) === String(c) ? "checked" : ""} aria-label="${esc(r)}: ${c}"></td>`).join("") + `</tr>`;
      });
      h += `</table></div>`;
      if (it.type === "matrixscale") h += `<div class="hint">1 = ${esc(it.low)}, 5 = ${esc(it.high)}</div>`;
    }
    return h + `</div>`;
  }

  function bind() {
    document.querySelectorAll("textarea[data-id]").forEach((el) => el.addEventListener("input", () => { answers[el.dataset.id] = el.value; save(); }));
    document.querySelectorAll("input[type=radio]:not([data-matrix])").forEach((el) => el.addEventListener("change", () => { answers[el.name] = el.value; save(); }));
    document.querySelectorAll("input[data-multi]").forEach((el) => el.addEventListener("change", () => {
      const id = el.dataset.multi;
      const q = SECTIONS.flatMap((s) => s.items).find((i) => i.id === id);
      let arr = (answers[id] || []).filter((x) => x !== el.value);
      if (el.checked) arr.push(el.value);
      if (q.max && arr.length > q.max) { el.checked = false; arr = arr.filter((x) => x !== el.value); alert("Maximal " + q.max + " Antworten."); }
      answers[id] = arr; save();
    }));
    document.querySelectorAll("input[data-matrix]").forEach((el) => el.addEventListener("change", () => {
      const id = el.dataset.matrix;
      answers[id] = answers[id] || {};
      answers[id][el.dataset.row] = el.value; save();
    }));
  }

  function countAnswered() {
    let total = 0, done = 0;
    SECTIONS.forEach((s) => s.items.forEach((it) => {
      if (it.rows) { total += it.rows.length; done += Object.keys(answers[it.id] || {}).length; }
      else { total++; const v = answers[it.id]; if (v && (!Array.isArray(v) || v.length) && String(v).trim()) done++; }
    }));
    return { total, done };
  }

  function payload() {
    let id = localStorage.getItem("fk_rid");
    if (!id) { id = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)); try { localStorage.setItem("fk_rid", id); } catch (e) {} }
    return { id, submitted_at: new Date().toISOString(), answers };
  }

  function download() {
    const blob = new Blob([JSON.stringify(payload(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "antworten-" + payload().id.slice(0, 8) + ".json";
    a.click();
  }

  async function submit() {
    const msg = $("#msg");
    const c = window.CONFIG || {};
    if (!c.supabaseUrl || !c.supabaseAnonKey) { download(); msg.innerHTML = '<div class="notice">Die Antworten wurden als Datei gespeichert. Bitte schicke sie an die neutrale Person, die die Auswertung macht.</div>'; return; }
    msg.textContent = "Wird gesendet …";
    try {
      const r = await fetch(c.supabaseUrl.replace(/\/$/, "") + "/rest/v1/" + (c.table || "antworten"), {
        method: "POST",
        headers: { apikey: c.supabaseAnonKey, Authorization: "Bearer " + c.supabaseAnonKey, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ answers }),
      });
      if (!r.ok) throw new Error(r.status + " " + (await r.text()));
      try { localStorage.removeItem(KEY); } catch (e) {}
      msg.innerHTML = '<div class="notice"><b>Danke!</b> Deine Antworten wurden anonym übermittelt. Du kannst dieses Fenster schließen.</div>';
      $("#sendbtn").disabled = true;
    } catch (e) {
      msg.innerHTML = '<div class="notice">Senden hat nicht geklappt (' + esc(e.message) + '). Lade stattdessen die Datei herunter und schicke sie der neutralen Person.</div>';
    }
  }

  function render() {
    const st = steps[cur];
    const v = $("#view");
    $("#prog").style.width = (cur / (steps.length - 1)) * 100 + "%";
    $("#step").textContent = st.kind === "section" ? `Abschnitt ${cur} von ${steps.length - 2}` : "";
    $("#back").style.visibility = cur === 0 ? "hidden" : "visible";
    $("#next").style.display = st.kind === "final" ? "none" : "";
    $("#next").textContent = cur === 0 ? "Los geht's" : "Weiter";
    if (st.kind === "intro") {
      v.innerHTML = `<div class="card"><h2>Worum geht es?</h2>
        <p>Wir sind fünf Core-Mitglieder und haben unterschiedliche Vorstellungen davon, was die India Initiative Real Estate GmbH tun und nicht tun soll. Mit diesem Katalog sammeln wir alle Erwartungen und Bedingungen, damit wir die gemeinsame Schnittmenge finden.</p>
        <div class="notice">${esc(INTRO.decided)}</div>
        <p><b>Anonym:</b> Es wird kein Name, keine E-Mail-Adresse und keine IP-Adresse abgefragt oder gespeichert. Deine Antworten werden erst nach dem Absenden ausgewertet, immer gemeinsam mit denen der anderen.</p>
        <p><b>Dauer:</b> etwa 20 bis 30 Minuten. Deine Eingaben werden laufend in diesem Browser gespeichert; du kannst unterbrechen und später weitermachen. Alle Fragen sind freiwillig, aber je ehrlicher und konkreter, desto besser das Ergebnis.</p></div>`;
    } else if (st.kind === "section") {
      v.innerHTML = `<h2>${esc(st.s.title)}</h2>` + (st.s.intro ? `<p class="mute">${esc(st.s.intro)}</p>` : "") + `<div class="card">` + st.s.items.map(renderQuestion).join("") + `</div>`;
      bind();
    } else {
      const { total, done } = countAnswered();
      v.innerHTML = `<div class="card"><h2>Fast fertig</h2>
        <p>Du hast ${done} von ${total} Punkten beantwortet. Du kannst mit „Zurück“ noch etwas ergänzen.</p>
        <p class="mute">Beim Absenden wird nur ein zufälliger Code zusammen mit deinen Antworten übertragen, nichts, was dich identifiziert. Bitte schreibe auch in Freitexten nichts, woran man dich erkennen würde.</p>
        <p><button id="sendbtn">Anonym absenden</button> <button class="sec" id="dl">Als Datei herunterladen</button></p><div id="msg"></div></div>`;
      $("#sendbtn").onclick = submit;
      $("#dl").onclick = download;
    }
    window.scrollTo(0, 0);
  }

  $("#next").onclick = () => { if (cur < steps.length - 1) { cur++; render(); } };
  $("#back").onclick = () => { if (cur > 0) { cur--; render(); } };
  render();
})();
