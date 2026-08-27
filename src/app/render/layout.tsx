/**
 * Layout khusus kanvas render: tanpa chrome aplikasi, tanpa padding.
 * Halaman di bawahnya dibuka oleh Chromium headless dan disalin apa adanya
 * jadi PNG, sekaligus dipakai sebagai pratinjau di iframe.
 */
export default function RenderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        background: '#ffffff',
        display: 'block',
        width: 'fit-content',
      }}
    >
      {children}
    </div>
  );
}
