import React, { useState } from 'react';

export default function FinalReport({ onNavigate }) {
  const [downloadNotification, setDownloadNotification] = useState('');
  const [activeTargetId, setActiveTargetId] = useState('target-egfr');

  const reportData = {
    reportId: "PTX-2026-0916-NSCLC",
    patientId: "PTX-PAT-8842",
    specimenId: "SP-2026-9041-NSCLC",
    sequencingPlatform: "Illumina NovaSeq 6000 (300x Deep Targeted Panel)",
    qualityScore: "Q38 (99.4% Mapped Alignment)",
    generatedAt: new Date().toISOString(),
    disease: "Non-Small Cell Lung Cancer (NSCLC - Adenocarcinoma)",
    analysisType: "Multi-Driver Axis Target Identification",
    targets: [
      {
        id: "target-egfr",
        nodeNum: "01",
        gene: "EGFR",
        fullName: "Epidermal Growth Factor Receptor",
        structure: "Kinase Domain • PDB: 7A2A",
        locus: "Chr 7p11.2 | Exons 18–21",
        animalModel: {
          species: "Gallus gallus",
          commonName: "Chicken",
          taxId: "9031",
          benchmark: "Avian Kinase Homology Benchmark",
          sequenceIdentity: "94.2%",
          catalyticTriad: "Lys745 - Glu762 - Asp855",
          rmsdFit: "0.42 Å",
          translationalFidelity: "0.96 / 1.0 (High Physiological Concordance)",
          imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9gMGcojrmRSXnC5L6rk73tGOE3RdzyhMSSN8l9LpNdzBPnacBOpM7Cj_u7Q_FMKLV-Xgm57Z08LJAyq56aWT8PDDTxqItBTCOFhf2X-qPQoV0CeWEO3qOo3DhDaKz8zd5CgsPmy6--w7P2f9nWeLfi1jlA7zKEy3AaiWMsZLmIXvQ0MTzt9zjxS82DYdtKVb5RWaAV8xfYWQeizSUl7WrZEE8J3g28AcKhjrOMxoSvr841LhPvS9J"
        },
        drugCandidate: {
          name: "Osimertinib",
          chemblId: "CHEMBL3358826",
          codeName: "AZD9291",
          class: "3rd Generation Irreversible EGFR-TKI",
          bindingKd: "0.52 nM",
          freeEnergyDeltaG: "-12.4 kcal/mol",
          rationale: "Covalent sulfur bond targeting Cys797 directly circumvents secondary gatekeeper T790M resistance mutations while sparing wild-type EGFR to minimize epidermal toxicities.",
          selectivityIndex: "180x Selective vs WT Kinome",
          confidenceScore: "96.8%"
        }
      },
      {
        id: "target-kras",
        nodeNum: "02",
        gene: "KRAS G12D",
        fullName: "KRAS G12D Oncogene Variant",
        structure: "Small GTPase • PDB: 8D20",
        locus: "Chr 12p12.1 | Gly12Asp Point Mutation",
        animalModel: {
          species: "Danio rerio",
          commonName: "Zebrafish",
          taxId: "7955",
          benchmark: "Embryonic GTPase Xenograft Screen",
          sequenceIdentity: "88.4%",
          catalyticTriad: "Switch-II Pocket Homology (Glu62 / Tyr96)",
          rmsdFit: "0.68 Å",
          translationalFidelity: "0.91 / 1.0 (Rapid High-Throughput Phenotyping)",
          imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1HHGaBRsHcRBrU2SlGMAgidOTpBF6AUZ0HBOgQkxVqA63ioCuWwxP7jlYAVbb9r8bR6a2KnXOdChw69gkw32MLLeyGhXNDki_yL1sk-lGlJxxdAaOs9mVm893tppuNMAQqzXik5HmOomnZD9ovI1cG57CbxupfI7oQpr8uRtnlnLIEy4i_7l_9klRr0RQ2KWyPMNTTJEuDbMiqMwCV6sZBcueer07jVspESAMWjpTaMIdi91r8Mo4"
        },
        drugCandidate: {
          name: "Sotorasib",
          chemblId: "CHEMBL4297800",
          codeName: "AMG 510",
          class: "Switch-II Covalent Allosteric Inhibitor",
          bindingKd: "1.10 nM",
          freeEnergyDeltaG: "-11.2 kcal/mol",
          rationale: "Traps KRAS in its inactive GDP-bound conformation via cryptic Switch-II groove interaction, blocking downstream RAF/MEK/ERK phosphorylation cascade with low hepatotoxicity risk.",
          selectivityIndex: "110x GDP vs GTP Conformation Lock",
          confidenceScore: "93.4%"
        }
      },
      {
        id: "target-alk",
        nodeNum: "03",
        gene: "ALK",
        fullName: "Anaplastic Lymphoma Kinase",
        structure: "Kinase Translocation EML4-ALK • PDB: 4CLI",
        locus: "Chr 2p23.2 | Intron 19 Inversion",
        animalModel: {
          species: "Mus musculus",
          commonName: "Lab Mouse",
          taxId: "10090",
          benchmark: "BALB/c Precision Syngeneic Model",
          sequenceIdentity: "91.8%",
          catalyticTriad: "100% Invariant (Arg1120)",
          rmsdFit: "0.38 Å",
          translationalFidelity: "0.98 / 1.0 (Direct CNS Metastasis Predictability)",
          imgUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCDEZDYrO6nyr7vc1zerJg2Vp7FbYRwBiGim7S0hZJddm5LuZ2TN98QVuflXgT2MjkL9oN1UHC01ccADMIiP4sicJMKlSULGpVUuJYPHbldE9hE6EBtFlY7LPmyy2b-uue3K7aoUUAmaO6V8hv2j9Oii60VAsCgI1aRQwiRUieCvhq1otnJDI4_kOHUiccFtfE9-1fP8WXfkfo_XCQbwMV5JmbTYfde2Rx2Rzx94LKlU61aatidA81"
        },
        drugCandidate: {
          name: "Alectinib",
          chemblId: "CHEMBL2105757",
          codeName: "RG7853",
          class: "2nd Gen Highly Potent ALK Kinase Inhibitor",
          bindingKd: "0.83 nM",
          freeEnergyDeltaG: "-11.9 kcal/mol",
          rationale: "Maintains optimal structural orientation bypassing L1196M gatekeeper mutation while demonstrating superior blood-brain barrier penetration against central nervous system metastases.",
          selectivityIndex: "0.74 (Brain-to-Plasma Unbound Ratio)",
          confidenceScore: "95.1%"
        }
      }
    ]
  };

  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(reportData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `phylotargetx_analysis_report_${reportData.reportId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadNotification('JSON Analysis Telemetry exported successfully!');
    setTimeout(() => setDownloadNotification(''), 4000);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const scrollToTarget = (targetId) => {
    setActiveTargetId(targetId);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-slate-100/70 to-emerald-50/20 font-body text-slate-800 antialiased min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Toast Notification */}
      {downloadNotification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950 text-emerald-100 px-5 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-bounce font-mono text-xs font-semibold">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span>{downloadNotification}</span>
        </div>
      )}

      {/* Full Screen Layout Grid (Edge to Edge) */}
      <div className="w-full max-w-[98vw] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ================= STICKY LEFT SIDEBAR (TRANSLUCENT RECTANGLE - 4 COLUMNS) ================= */}
        <aside className="lg:col-span-4 bg-white/75 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-6 shadow-xl space-y-6 lg:sticky lg:top-20 z-30">

          {/* Patient Telemetry Card */}
          <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Patient Telemetry Triage
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[10px] font-bold">
                ISO 15189
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500">Patient ID:</span>
                <strong className="text-slate-900 font-bold">{reportData.patientId}</strong>
              </div>
              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500">Specimen Run:</span>
                <strong className="text-slate-900 font-bold">{reportData.specimenId}</strong>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-500 block text-[10px]">Indication Profile</span>
                <strong className="text-slate-900 font-semibold block leading-tight">
                  {reportData.disease}
                </strong>
              </div>
              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500">QC Status:</span>
                <strong className="text-emerald-700 font-bold">{reportData.qualityScore}</strong>
              </div>
            </div>
          </div>

          {/* Target Navigation Index Rail */}
          <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Target Navigation Index
              </span>
              <span className="font-mono text-[10px] text-slate-400">3 Nodes</span>
            </div>

            <div className="space-y-2">
              {reportData.targets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => scrollToTarget(t.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    activeTargetId === t.id
                      ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                      activeTargetId === t.id ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {t.nodeNum}
                    </span>
                    <div>
                      <h4 className="font-headline text-xs font-bold text-slate-900">{t.gene}</h4>
                      <span className="font-mono text-[10px] text-slate-500">{t.drugCandidate.name}</span>
                    </div>
                  </div>

                  <span className="font-mono text-xs text-emerald-700 font-bold">
                    {t.animalModel.sequenceIdentity}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={handleDownloadPDF}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-headline text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              <span>Download PDF Clinical Dossier</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-headline text-xs font-bold border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>Export Raw Telemetry (JSON)</span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-300 font-headline text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Start New Target Analysis</span>
            </button>
          </div>

          {/* Cryptographic Enclave Audit Stamp */}
          <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 font-mono text-[10px] text-slate-500 space-y-1.5">
            <div className="flex items-center justify-between text-slate-700 font-bold border-b border-slate-200 pb-1.5">
              <span>Cryptographic Audit Hash</span>
              <span className="text-emerald-700">SHA-256 Validated</span>
            </div>
            <div className="break-all text-slate-800 font-semibold bg-white p-2 rounded border border-slate-200">
              0x9FD824B7A12C384E910F41566B093C
            </div>
            <div className="flex items-center justify-between text-slate-400 pt-1">
              <span>FDA 21 CFR Part 11</span>
              <span>gnomAD v4.1 Synced</span>
            </div>
          </div>

        </aside>

        {/* ================= MAIN THERAPEUTIC DOSSIER (UNIFIED TRANSLUCENT RECTANGLE - 8 COLUMNS) ================= */}
        <main className="lg:col-span-8 bg-white/75 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-6 lg:p-8 shadow-xl space-y-6">

          {/* Top Header Banner */}
          <div className="bg-slate-50/90 rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs shrink-0">
                <span className="material-symbols-outlined text-[28px]">biotech</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-headline text-2xl font-bold text-slate-900 tracking-tight">
                    PhyloTargetX Final Analysis Report
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono text-[11px] font-bold">
                    Report #{reportData.reportId}
                  </span>
                </div>
                <p className="font-body text-xs text-slate-500 mt-1">
                  Phylogenetic Animal Model Selection &amp; Precision Therapeutic Affinity Summary
                </p>
              </div>
            </div>
          </div>

          {/* Target Identification Flowchart Section */}
          <section className="bg-slate-50/90 rounded-2xl p-6 lg:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[11px] font-bold mb-1 border border-emerald-200">
                  <span className="material-symbols-outlined text-[15px]">account_tree</span>
                  TARGET IDENTIFICATION &amp; DISCOVERY FLOW
                </div>
                <h2 className="font-headline text-xl font-bold text-slate-900 tracking-tight">
                  Disease-to-Protein Dynamic Pipeline
                </h2>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">dynamic_form</span>
                <span>Dynamic Target Binding: <strong className="text-slate-900 font-semibold">3 Targets Validated</strong></span>
              </div>
            </div>

            {/* Node Flowchart Map */}
            <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4 relative">
              {/* Root Disease Node */}
              <div className="w-full md:w-64 bg-gradient-to-br from-emerald-50 to-white p-4 rounded-xl border border-emerald-200 shadow-xs flex flex-col shrink-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700">Target Indication</span>
                  <span className="material-symbols-outlined text-emerald-700 text-[20px]">lungs</span>
                </div>
                <div className="mt-2">
                  <span className="font-headline text-base font-bold text-slate-900 block leading-snug">Non-Small Cell Lung Cancer</span>
                  <span className="font-mono text-xs text-slate-500 font-medium">(NSCLC - Adenocarcinoma)</span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between font-mono text-[11px] text-slate-500">
                  <span>Multi-Driver Axis</span>
                  <span className="text-emerald-700 font-bold">Active Profile</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex flex-col items-center justify-center text-emerald-600 shrink-0">
                <span className="material-symbols-outlined text-[28px]">arrow_forward</span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Tri-Split</span>
              </div>

              {/* Target Cards Grid */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                {reportData.targets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => scrollToTarget(t.id)}
                    className="group text-left bg-white hover:bg-emerald-50/70 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 transition-all shadow-xs flex flex-col justify-between cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 tracking-wide">
                        NODE {t.nodeNum}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-emerald-600 transition-colors">north_east</span>
                    </div>
                    <div className="mt-2">
                      <h3 className="font-headline text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{t.gene}</h3>
                      <p className="font-body text-[11px] text-slate-500 truncate">{t.fullName}</p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between font-mono text-[10px]">
                      <span className="text-slate-400">{t.animalModel.species}</span>
                      <span className="text-emerald-700 font-bold">{t.animalModel.sequenceIdentity}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Per-Protein Breakdown Sections */}
          <div className="space-y-6">
            {reportData.targets.map((t) => (
              <section
                key={t.id}
                id={t.id}
                className="bg-slate-50/90 rounded-2xl p-6 lg:p-8 border border-slate-200/80 shadow-xs scroll-mt-24"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 font-mono text-xs font-bold tracking-wide uppercase border border-emerald-200">
                      Target {t.nodeNum}
                    </span>
                    <h2 className="font-headline text-lg font-bold text-slate-900">
                      {t.gene} ({t.fullName})
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-white font-mono text-xs text-slate-600 font-medium border border-slate-200">
                      {t.structure}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-400">{t.locus}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Component A: Best Animal Model */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200/90 flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                          <span className="font-headline text-xs font-extrabold uppercase text-emerald-800 tracking-wider">
                            A) Optimal In Vivo Animal Model
                          </span>
                        </div>
                        <span className="font-mono text-xs text-slate-400">TaxID: {t.animalModel.taxId}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 mt-3">
                        <div className="w-full sm:w-36 h-32 rounded-lg overflow-hidden shrink-0 border border-slate-200 shadow-xs bg-slate-100 flex items-center justify-center">
                          <img
                            src={t.animalModel.imgUrl}
                            alt={t.animalModel.species}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <h4 className="font-headline text-base font-bold text-slate-900">
                              {t.animalModel.species} <span className="font-normal text-slate-500">({t.animalModel.commonName})</span>
                            </h4>
                            <span className="font-mono text-xs text-emerald-700 font-semibold">{t.animalModel.benchmark}</span>
                          </div>
                          <div className="space-y-1 text-xs font-mono text-slate-600">
                            <div className="flex justify-between items-center bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                              <span>Sequence Identity</span>
                              <strong className="text-emerald-700 font-bold">{t.animalModel.sequenceIdentity}</strong>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                              <span>Catalytic Triad / Homology</span>
                              <strong className="text-slate-800 font-semibold truncate max-w-[140px]">{t.animalModel.catalyticTriad}</strong>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                              <span>RMSD Pocket Fit</span>
                              <strong className="text-emerald-700 font-bold">{t.animalModel.rmsdFit}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-2.5 border-t border-slate-200 font-mono text-[11px] text-slate-500 flex items-center justify-between">
                      <span>In Vivo Translational Fidelity:</span>
                      <span className="text-emerald-700 font-bold">{t.animalModel.translationalFidelity}</span>
                    </div>
                  </div>

                  {/* Component B: Best Drug Candidate */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200/90 flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                          <span className="font-headline text-xs font-extrabold uppercase text-sky-800 tracking-wider">
                            B) Best Screened Drug Candidate
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold border border-emerald-200">
                          {t.drugCandidate.confidenceScore} Confidence
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-headline text-base font-bold text-slate-900">
                            {t.drugCandidate.name} <span className="text-slate-500 font-normal font-mono">({t.drugCandidate.codeName})</span>
                          </h4>
                          <span className="font-mono text-xs text-slate-500 block">{t.drugCandidate.class} • {t.drugCandidate.chemblId}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                            <span className="text-slate-400 text-[11px] block">Binding Affinity (Kd)</span>
                            <span className="text-slate-900 font-bold text-sm">{t.drugCandidate.bindingKd}</span>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                            <span className="text-slate-400 text-[11px] block">Predicted ΔG</span>
                            <span className="text-emerald-700 font-bold text-sm">{t.drugCandidate.freeEnergyDeltaG}</span>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                          <span className="font-mono text-[10px] text-slate-400 font-bold uppercase block mb-1">Mechanistic Rationale</span>
                          <p className="font-body text-xs text-slate-700 leading-relaxed">
                            {t.drugCandidate.rationale}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-2.5 border-t border-slate-200 font-mono text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Selectivity Index:</span>
                      <span className="text-emerald-700 font-bold">{t.drugCandidate.selectivityIndex}</span>
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>

          {/* Bottom Action Section */}
          <section className="bg-slate-50/90 rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">Report Status: Complete</span>
              <p className="font-body text-xs text-slate-600 mt-0.5">All 3 Target proteins fully validated with sequence homology &amp; high-affinity compounds.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadPDF}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-headline text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                <span>Download PDF Report</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-headline text-xs font-bold border border-slate-300 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">file_download</span>
                <span>Export Telemetry</span>
              </button>
            </div>
          </section>

        </main>

      </div>
    </div>
  );
}
