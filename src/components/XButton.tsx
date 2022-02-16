import "./XButton.css";

interface Props {
  onClick: () => void;
}

export function XButton({ onClick }: Props) {
  return (
    <button className="xbutton" onClick={onClick}>
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.00357 7.58673C0.613042 7.97725 0.613042 8.61042 1.00357 9.00094C1.39409 9.39146 2.02726 9.39146 2.41778 9.00094L1.00357 7.58673ZM9.00356 2.41516C9.39408 2.02464 9.39408 1.39147 9.00356 1.00095C8.61304 0.610423 7.97987 0.610423 7.58935 1.00095L9.00356 2.41516ZM7.59383 9.00092C7.98435 9.39144 8.61752 9.39144 9.00804 9.00092C9.39857 8.61039 9.39857 7.97723 9.00804 7.58671L7.59383 9.00092ZM2.42226 1.00093C2.03174 0.610401 1.39857 0.610401 1.00805 1.00093C0.617524 1.39145 0.617524 2.02461 1.00805 2.41514L2.42226 1.00093ZM2.41778 9.00094L9.00356 2.41516L7.58935 1.00095L1.00357 7.58673L2.41778 9.00094ZM9.00804 7.58671L2.42226 1.00093L1.00805 2.41514L7.59383 9.00092L9.00804 7.58671Z"
          fill="white"
        />
      </svg>
    </button>
  );
}