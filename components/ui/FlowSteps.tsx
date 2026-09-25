const STEPS = ["1. Pilih Produk", "2. Bayar QRIS", "3. Status"] as const;

interface FlowStepsProps {
  /** Jumlah step yang sudah selesai / sedang aktif (1-3). */
  activeStep: 1 | 2 | 3;
}

export function FlowSteps({ activeStep }: FlowStepsProps) {
  return (
    <div className="flow" aria-label={`Langkah ${activeStep} dari 3`}>
      {STEPS.map((step, index) => (
        <span key={step} className="flex items-center gap-1.5">
          {index > 0 && <b className="flow-sep">—</b>}
          <i className="flow-step" data-active={index < activeStep}>
            {step}
          </i>
        </span>
      ))}
    </div>
  );
}
