import React, { useState } from 'react';

export default function AnalysisWizard({ onNavigate }) {
  const [currentProteinIndex, setCurrentProteinIndex] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('animals'); // 'animals' | 'drugs'

  const proteins = [
    {
      gene: "EGFR",
      name: "Epidermal Growth Factor Receptor",
      pdb: "7A2A",
      animals: [
        { name: "Gallus gallus (Chicken)", identity: "94.2%", rmsd: "0.42 Å", rank: 1, isTop: true, matchColor: "text-emerald-600 bg-emerald-50 border-emerald-300" },
        { name: "Mus musculus (Mouse)", identity: "89.1%", rmsd: "0.65 Å", rank: 2, isTop: false, matchColor: "text-emerald-700 bg-emerald-50/70 border-emerald-200" },
        { name: "Danio rerio (Zebrafish)", identity: "81.4%", rmsd: "1.05 Å", rank: 3, isTop: false, matchColor: "text-amber-700 bg-amber-50 border-amber-200" }
      ],
      drugs: [
        { name: "Osimertinib (AZD9291)", chembl: "CHEMBL3358826", kd: "0.52 nM", deltaG: "-12.4 kcal/mol", confidence: 96.8, aura: "emerald" },
        { name: "Gefitinib", chembl: "CHEMBL939", kd: "3.10 nM", deltaG: "-10.1 kcal/mol", confidence: 84.2, aura: "emerald" },
        { name: "Erlotinib", chembl: "CHEMBL939", kd: "4.80 nM", deltaG: "-9.4 kcal/mol", confidence: 78.5, aura: "rose" }
      ]
    },
    {
      gene: "KRAS G12D",
      name: "KRAS G12D Oncogene Variant",
      pdb: "8D20",
      animals: [
        { name: "Danio rerio (Zebrafish)", identity: "88.4%", rmsd: "0.68 Å", rank: 1, isTop: true, matchColor: "text-emerald-600 bg-emerald-50 border-emerald-300" },
        { name: "Mus musculus (Mouse)", identity: "85.2%", rmsd: "0.82 Å", rank: 2, isTop: false, matchColor: "text-emerald-700 bg-emerald-50/70 border-emerald-200" },
        { name: "Drosophila melanogaster (Fruit Fly)", identity: "72.9%", rmsd: "1.44 Å", rank: 3, isTop: false, matchColor: "text-rose-700 bg-rose-50 border-rose-200" }
      ],
      drugs: [
        { name: "Sotorasib (AMG 510)", chembl: "CHEMBL4297800", kd: "1.10 nM", deltaG: "-11.2 kcal/mol", confidence: 93.4, aura: "emerald" },
        { name: "Adagrasib (MRTX849)", chembl: "CHEMBL4462153", kd: "1.65 nM", deltaG: "-10.8 kcal/mol", confidence: 89.7, aura: "emerald" }
      ]
    },
    {
      gene: "ALK",
      name: "Anaplastic Lymphoma Kinase",
      pdb: "4CLI",
      animals: [
        { name: "Mus musculus (Lab Mouse)", identity: "91.8%", rmsd: "0.38 Å", rank: 1, isTop: true, matchColor: "text-emerald-600 bg-emerald-50 border-emerald-300" },
        { name: "Rattus norvegicus (Rat)", identity: "90.5%", rmsd: "0.45 Å", rank: 2, isTop: false, matchColor: "text-emerald-700 bg-emerald-50/70 border-emerald-200" }
      ],
      drugs: [
        { name: "Alectinib (RG7853)", chembl: "CHEMBL2105757", kd: "0.83 nM", deltaG: "-11.9 kcal/mol", confidence: 95.1, aura: "emerald" },
        { name: "Lorlatinib (PF-06463922)", chembl: "CHEMBL3545229", kd: "1.02 nM", deltaG: "-11.5 kcal/mol", confidence: 92.3, aura: "emerald" }
      ]
    }
  ];

  const currentProtein = proteins[currentProteinIndex];
  const isLastProtein = currentProteinIndex === proteins.length - 1;

  const handleNextPhaseOrProtein = () => {
    if (currentPhase === 'animals') {
      setCurrentPhase('drugs');
    } else {
      if (isLastProtein) {
        if (onNavigate) onNavigate('report');
      } else {
        setCurrentProteinIndex((prev) => prev + 1);
        setCurrentPhase('animals');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 font-body text-slate-800 antialiased py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Wizard Progress Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="font-mono text-xs uppercase text-emerald-800 font-bold tracking-wider">
                Step 2 of 3 — Interactive Analysis Wizard
              </span>
              <h1 className="font-headline text-2xl font-bold text-slate-900 mt-1">
                Evaluating Target Protein: <span className="text-emerald-700">{currentProtein.gene}</span>
              </h1>
              <p className="font-body text-xs text-slate-500 mt-0.5">{currentProtein.name} • PDB: {currentProtein.pdb}</p>
            </div>
            
            {/* Step Pills */}
            <div className="flex items-center gap-2">
              {proteins.map((p, idx) => (
                <div
                  key={p.gene}
                  onClick={() => {
                    setCurrentProteinIndex(idx);
                    setCurrentPhase('animals');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                    idx === currentProteinIndex
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : idx < currentProteinIndex
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {p.gene}
                </div>
              ))}
            </div>
          </div>

          {/* Phase Toggle Indicator */}
          <div className="flex items-center justify-around mt-4 pt-2 font-mono text-xs font-bold">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              currentPhase === 'animals' ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs' : 'text-slate-400 border-transparent'
            }`}>
              <span className="material-symbols-outlined text-[18px]">pets</span>
              <span>Phase 2A: Animal Model Ranking</span>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              currentPhase === 'drugs' ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs' : 'text-slate-400 border-transparent'
            }`}>
              <span className="material-symbols-outlined text-[18px]">medication</span>
              <span>Phase 2B: Drug Candidate Screening</span>
            </div>
          </div>
        </div>

        {/* Phase Content */}
        {currentPhase === 'animals' ? (
          /* Phase 2A: Animal Model Ranking */
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline text-lg font-bold text-slate-900">
                  Phylogenetic Animal Conservation Ranking
                </h2>
                <p className="font-body text-xs text-slate-500">
                  Ranking candidate model organisms by active site conservation for {currentProtein.gene}.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono text-xs font-bold border border-emerald-200">
                Phase 2A Active
              </span>
            </div>

            <div className="space-y-4">
              {currentProtein.animals.map((anim) => (
                <div
                  key={anim.name}
                  className={`p-5 rounded-xl border transition-all ${
                    anim.isTop
                      ? 'bg-gradient-to-r from-emerald-50/90 to-white border-emerald-300 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono text-sm font-bold ${
                        anim.isTop ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        #{anim.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-headline text-base font-bold text-slate-900">{anim.name}</h3>
                          {anim.isTop && (
                            <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-950 font-mono text-[10px] font-bold">
                              OPTIMAL MODEL
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs text-slate-500">Active Site Fit RMSD: {anim.rmsd}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 font-mono text-xs">
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Sequence Identity</span>
                        <span className="text-slate-900 font-bold text-base">{anim.identity}</span>
                      </div>
                      <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: anim.identity }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleNextPhaseOrProtein}
                className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-headline text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Drug Discovery</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        ) : (
          /* Phase 2B: Drug Candidate Ranking */
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline text-lg font-bold text-slate-900">
                  Virtual Screening &amp; AI Affinity Ranking
                </h2>
                <p className="font-body text-xs text-slate-500">
                  Top-scoring candidate compounds evaluated against {currentProtein.gene} binding pocket.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono text-xs font-bold border border-emerald-200">
                Phase 2B Active
              </span>
            </div>

            <div className="space-y-4">
              {currentProtein.drugs.map((drug, idx) => (
                <div
                  key={drug.name}
                  className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-emerald-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        <h3 className="font-headline text-base font-bold text-slate-900">{drug.name}</h3>
                        <span className="font-mono text-xs text-slate-500">({drug.chembl})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold">
                        AI Confidence: {drug.confidence}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 font-mono text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Predicted Kd</span>
                      <span className="text-slate-900 font-bold">{drug.kd}</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Free Energy (ΔG)</span>
                      <span className="text-emerald-700 font-bold">{drug.deltaG}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setCurrentPhase('animals')}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 font-headline text-xs font-medium transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Back to Animal Models</span>
              </button>

              <button
                onClick={handleNextPhaseOrProtein}
                className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-headline text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{isLastProtein ? 'View Final Analysis Report' : `Next Protein: ${proteins[currentProteinIndex + 1]?.gene}`}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
