// Public participant policy only. Internal finances never belong in this module.
export const eoaPolicy = {
  durationMonths: 24,
  annualFee: 4000,
  globalFee: 1750,
  localFee: 2250,
  sponsorShare: 2000,
  participantShare: 2000,
  groupMin: 4,
  groupMax: 6,
} as const
export function eoaIntakeAction(open: boolean | undefined, ar: boolean) {
  return open
    ? {
        href: '/eoa/apply',
        label: ar ? 'قدّم طلبك' : 'Apply to EO Accelerator',
      }
    : {
        href: '/eoa/contact',
        label: ar ? 'استفسر عن الدفعة القادمة' : 'Ask about the next intake',
      }
}
export function eoaDeliveryStage(paid: number) {
  return paid >= 15
    ? 'in_person'
    : paid >= 10
      ? 'virtual_trainer'
      : 'global_virtual'
}
