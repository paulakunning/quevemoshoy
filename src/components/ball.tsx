import Image from "next/image";

type BallProps =
  | { state: "idle" | "loading" | "thinking" }
  | { state: "revealed"; posterUrl?: string }
  | { state: "message"; lines: [string, string] };

// Decoration only (aria-hidden): what it shows is also said in text on the page.
// The looks and the animations live in globals.css, keyed on `data-ball`
export function Ball(props: BallProps) {
  return (
    <div className="ball-wrap" aria-hidden="true">
      <div className="float">
        <div className="ball" data-ball={props.state}>
          <div className="face-8 font-sans">8</div>
          {props.state === "revealed" && (
            <div className="window">
              {props.posterUrl && (
                <Image
                  src={props.posterUrl}
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
          {(props.state === "thinking" || props.state === "message") && (
            <div className="window">
              {props.state === "thinking" && <div className="swirl" />}
              <Die
                lines={props.state === "message" ? props.lines : undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// The triangle floating in the window: "?" while thinking, two words for a message
function Die({ lines }: { lines?: [string, string] }) {
  return (
    <svg className="die" viewBox="0 0 100 90">
      <defs>
        <linearGradient id="die-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <polygon
        points="50,6 94,82 6,82"
        fill="url(#die-fill)"
        stroke="rgb(255 255 255 / 0.45)"
        strokeWidth="1.5"
      />
      {lines ? (
        <text
          textAnchor="middle"
          fontWeight="700"
          fontSize="9.5"
          letterSpacing="0.6"
          fill="#fff"
          className="font-sans"
        >
          <tspan x="50" y="54">
            {lines[0]}
          </tspan>
          <tspan x="50" y="66">
            {lines[1]}
          </tspan>
        </text>
      ) : (
        <text
          x="50"
          y="72"
          textAnchor="middle"
          fontWeight="800"
          fontSize="40"
          fill="#fff"
          className="font-display"
        >
          ?
        </text>
      )}
    </svg>
  );
}
