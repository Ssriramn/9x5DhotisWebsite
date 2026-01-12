function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (cell || row.length) {
        row.push(cell.trim());
        rows.push(row);
        row = [];
        cell = '';
      }
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }

  return rows;
}

async function loadSheet(sheetUrl, containerId){
  const output=document.getElementById(containerId);
  output.innerHTML='<div class="loading">Loading Dhotis...</div>';
  try{
    const csvUrl = sheetUrl.replace('/edit','#gid=0').replace('edit?gid=','export?format=csv&gid=');
    const res = await fetch(csvUrl, {
    headers: {
    'Cache-Control': 'public, max-age=3600'
    }});
    
    const text = await res.text();
    const rows = parseCSV(text);


    
    const headers = rows[0];
    const idxName=headers.indexOf('Article Number');
    const idxRate=headers.indexOf('Rate');
    const idxStock=headers.indexOf('Stock');
    const idxDesc=headers.indexOf('Description');
    const idxPic1=headers.indexOf('Picture 1');
    const idxPic2=headers.indexOf('Picture 2');
    const idxPic3=headers.indexOf('Picture 3');

    let html='';
    rows.slice(1).forEach(r=>{
      if(!r[idxName]) return;
      
    const pics = [r[idxPic1], r[idxPic2], r[idxPic3]]
    .map(v => v ? v.replace(/^"+|"+$/g, '') : '')
    .filter(Boolean);
      html+=`<div class="card">

<img 
  src="${pics[0] || 'Logo.jpeg'}"
  alt="${r[idxName]}"
  loading="lazy"
  decoding="async"
   referrerpolicy="no-referrer"
  onerror="this.onerror=null;this.src='Logo.jpeg';"
/>



        
        <div class="card-body">
          <h3>${r[idxName]}</h3>
          <p><strong>Price:</strong> ₹${r[idxRate]||''}</p>
          <p><strong>Stock:</strong> ${r[idxStock]||''}</p>
          <p>${r[idxDesc]||''}</p>
          <a class="btn-whatsapp" target="_blank"
             href="https://wa.me/919629973204?text=I%20want%20to%20buy%20this%20dhoti:%20${encodeURIComponent(r[idxName])}">
             Buy on WhatsApp</a>
        </div>
      </div>`;
    });
    output.innerHTML=html || '<div class="loading">No products found.</div>';
  }catch(e){
    output.innerHTML='<div class="loading">Error loading products.</div>';
    console.error(e);
  }
}



