export default function AntiClickjacking() {
  return (
    <>
      <style id="antiClickjack">{`
        body { display: none !important; }
      `}</style>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (self === top) {
              var antiClickjack = document.getElementById("antiClickjack");
              antiClickjack.parentNode.removeChild(antiClickjack);
            } else {
              top.location = self.location;
            }
          `,
        }}
      />
    </>
  );
}
