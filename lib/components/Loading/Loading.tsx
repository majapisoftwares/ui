import { memo } from "react";

function Loading({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      className={className}
    >
      <circle cx="4" cy="12" r="3" fill="currentColor">
        <animate
          attributeName="opacity"
          begin="0s"
          dur="1.5s"
          repeatCount="indefinite"
          values="1;0.2;1"
        />
      </circle>
      <circle cx="12" cy="12" r="3" fill="currentColor">
        <animate
          attributeName="opacity"
          begin="0.3s"
          dur="1.5s"
          repeatCount="indefinite"
          values="1;0.2;1"
        />
      </circle>
      <circle cx="20" cy="12" r="3" fill="currentColor">
        <animate
          attributeName="opacity"
          begin="0.6s"
          dur="1.5s"
          repeatCount="indefinite"
          values="1;0.2;1"
        />
      </circle>
    </svg>
  );
}

export default memo(Loading);
