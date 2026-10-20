// Lightweight refresh adapter. Main bridge owns lifecycle and one latest-message bar.
$(() => { try { window.parent.DreamLantern?.refresh(); } catch {} });
