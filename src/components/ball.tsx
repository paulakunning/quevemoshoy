import Image from "next/image";

type BallProps = {
  state: "idle" | "loading" | "revealed";
  posterUrl?: string;
};

// Decoration only (aria-hidden): what it shows is also said in text on the page.
// The looks and the animations live in globals.css, keyed on `data-ball`
export function Ball({ state, posterUrl }: BallProps) {
  return (
    <div className="ball-wrap" aria-hidden="true">
      <div className="float">
        <div className="ball" data-ball={state}>
          <div className="face-8 font-sans">8</div>
          {state === "revealed" && (
            <div className="window">
              {posterUrl && (
                <Image
                  src={posterUrl}
                  alt=""
                  fill
                  sizes="280px"
                  preload
                  className="win-poster"
                />
              )}
              <div className="flash" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
