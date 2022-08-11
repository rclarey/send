import { Link, LinkProps, useMatch, useResolvedPath } from "react-router-dom";

import "./Nav.css";

function Logo() {
  return (
    <svg
      className="logo"
      width="90.3"
      height="36"
      viewBox="0 0 94 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M82.0135 20L80.91 18.332L80.8346 18.3819L80.7641 18.4383L82.0135 20ZM87.4361 11.8016C86.6007 11.079 85.3376 11.1705 84.6151 12.006C83.8925 12.8414 83.984 14.1045 84.8195 14.827L87.4361 11.8016ZM91.2707 17.7622L92.9055 18.9143L93.9487 17.4341L92.579 16.2494L91.2707 17.7622ZM85.5216 22.4479C84.8853 23.3507 85.1014 24.5985 86.0042 25.2348C86.9071 25.8711 88.1549 25.655 88.7912 24.7521L85.5216 22.4479ZM1.624 20.5352C0.53913 20.7429 -0.171996 21.7907 0.0356611 22.8756C0.243318 23.9605 1.29112 24.6716 2.376 24.4639L1.624 20.5352ZM46.0135 20L47.2629 18.4383L46.0135 20ZM70.0135 20L71.2629 18.4383L70.0135 20ZM83.1171 21.668C84.1074 21.0128 85.568 20.5511 87.2454 20.3386C88.9016 20.1288 90.5991 20.1839 91.9458 20.4257L92.6527 16.4886C90.8877 16.1717 88.7818 16.1121 86.7428 16.3703C84.7249 16.6259 82.5984 17.215 80.91 18.332L83.1171 21.668ZM84.8195 14.827L89.9624 19.2749L92.579 16.2494L87.4361 11.8016L84.8195 14.827ZM89.6359 16.61L85.5216 22.4479L88.7912 24.7521L92.9055 18.9143L89.6359 16.61ZM9.83835 17.7347C8.12095 18.6827 7.07099 19.172 5.99477 19.5276C4.89094 19.8923 3.69804 20.1383 1.624 20.5352L2.376 24.4639C4.40899 24.0748 5.85812 23.7854 7.24976 23.3256C8.66901 22.8566 9.96795 22.2321 11.7713 21.2367L9.83835 17.7347ZM11.2629 21.5617C13.8478 19.4938 15.9003 17.5743 17.4991 15.8006L14.528 13.1225C13.1036 14.7026 11.2178 16.4754 8.76414 18.4383L11.2629 21.5617ZM17.4991 15.8006C21.37 11.5062 22.8652 7.73045 22.1769 4.67571C21.4493 1.44696 18.5509 -9.53674e-07 16.0135 -9.53674e-07C13.4761 -9.53674e-07 10.5778 1.44696 9.8502 4.67571C9.16182 7.73045 10.657 11.5062 14.528 15.8006L17.4991 13.1225C13.8816 9.10919 13.5047 6.65417 13.7523 5.55505C13.9608 4.62996 14.8067 4 16.0135 4C17.2204 4 18.0662 4.62996 18.2747 5.55505C18.5224 6.65417 18.1455 9.10919 14.528 13.1225L17.4991 15.8006ZM14.528 15.8006C16.1267 17.5743 18.1793 19.4938 20.7641 21.5617L23.2629 18.4383C20.8093 16.4754 18.9234 14.7026 17.4991 13.1225L14.528 15.8006ZM20.7641 21.5617C23.2178 23.5246 25.1036 25.2974 26.528 26.8775L29.4991 24.1994C27.9003 22.4257 25.8478 20.5062 23.2629 18.4383L20.7641 21.5617ZM26.528 26.8775C30.1455 30.8908 30.5224 33.3458 30.2747 34.4449C30.0662 35.37 29.2204 36 28.0135 36C26.8067 36 25.9608 35.37 25.7523 34.4449C25.5047 33.3458 25.8816 30.8908 29.4991 26.8775L26.528 24.1994C22.657 28.4938 21.1618 32.2696 21.8502 35.3243C22.5778 38.553 25.4761 40 28.0135 40C30.5509 40 33.4493 38.553 34.1769 35.3243C34.8652 32.2696 33.37 28.4938 29.4991 24.1994L26.528 26.8775ZM29.4991 26.8775C30.9234 25.2974 32.8093 23.5246 35.2629 21.5617L32.7641 18.4383C30.1793 20.5062 28.1267 22.4257 26.528 24.1994L29.4991 26.8775ZM35.2629 21.5617C37.8478 19.4938 39.9003 17.5743 41.4991 15.8006L38.528 13.1225C37.1036 14.7026 35.2178 16.4754 32.7641 18.4383L35.2629 21.5617ZM41.4991 15.8006C45.37 11.5062 46.8652 7.73045 46.1769 4.67572C45.4493 1.44696 42.5509 0 40.0135 0C37.4761 0 34.5778 1.44696 33.8502 4.67572C33.1618 7.73045 34.657 11.5062 38.528 15.8006L41.4991 13.1225C37.8816 9.10919 37.5047 6.65417 37.7523 5.55505C37.9608 4.62996 38.8067 4 40.0135 4C41.2204 4 42.0662 4.62996 42.2747 5.55505C42.5224 6.65417 42.1455 9.10919 38.528 13.1225L41.4991 15.8006ZM38.528 15.8006C40.1267 17.5743 42.1793 19.4938 44.7641 21.5617L47.2629 18.4383C44.8093 16.4754 42.9234 14.7026 41.4991 13.1225L38.528 15.8006ZM44.7641 21.5617C47.2178 23.5246 49.1036 25.2974 50.528 26.8775L53.4991 24.1994C51.9003 22.4257 49.8478 20.5062 47.2629 18.4383L44.7641 21.5617ZM50.528 26.8775C54.1455 30.8908 54.5224 33.3458 54.2747 34.4449C54.0662 35.37 53.2204 36 52.0135 36C50.8067 36 49.9608 35.37 49.7523 34.4449C49.5047 33.3458 49.8816 30.8908 53.4991 26.8775L50.528 24.1994C46.657 28.4938 45.1618 32.2696 45.8502 35.3243C46.5778 38.553 49.4761 40 52.0135 40C54.5509 40 57.4493 38.553 58.1768 35.3243C58.8652 32.2696 57.37 28.4938 53.4991 24.1994L50.528 26.8775ZM53.4991 26.8775C54.9234 25.2974 56.8093 23.5246 59.2629 21.5617L56.7641 18.4383C54.1793 20.5062 52.1267 22.4257 50.528 24.1994L53.4991 26.8775ZM59.2629 21.5617C61.8478 19.4938 63.9003 17.5743 65.4991 15.8006L62.528 13.1225C61.1036 14.7026 59.2178 16.4754 56.7641 18.4383L59.2629 21.5617ZM65.4991 15.8006C69.37 11.5062 70.8652 7.73045 70.1768 4.67572C69.4493 1.44696 66.5509 0 64.0135 -2.38419e-07C61.4761 -4.76837e-07 58.5778 1.44696 57.8502 4.67571C57.1618 7.73045 58.657 11.5062 62.528 15.8006L65.4991 13.1225C61.8816 9.10919 61.5047 6.65417 61.7523 5.55505C61.9608 4.62996 62.8067 4 64.0135 4C65.2204 4 66.0662 4.62996 66.2747 5.55505C66.5224 6.65417 66.1455 9.10919 62.528 13.1225L65.4991 15.8006ZM62.528 15.8006C64.1267 17.5743 66.1793 19.4938 68.7641 21.5617L71.2629 18.4383C68.8093 16.4754 66.9234 14.7026 65.4991 13.1225L62.528 15.8006ZM68.7641 21.5617C71.2177 23.5246 73.1036 25.2974 74.528 26.8775L77.4991 24.1994C75.9003 22.4257 73.8478 20.5062 71.2629 18.4383L68.7641 21.5617ZM74.528 26.8775C78.1455 30.8908 78.5224 33.3458 78.2747 34.4449C78.0662 35.37 77.2204 36 76.0135 36C74.8067 36 73.9608 35.37 73.7523 34.4449C73.5047 33.3458 73.8816 30.8908 77.4991 26.8775L74.528 24.1994C70.657 28.4938 69.1618 32.2696 69.8502 35.3243C70.5778 38.553 73.4761 40 76.0135 40C78.5509 40 81.4493 38.553 82.1768 35.3243C82.8652 32.2696 81.37 28.4938 77.4991 24.1994L74.528 26.8775ZM77.4991 26.8775C78.9234 25.2974 80.8093 23.5247 83.2629 21.5618L80.7641 18.4383C78.1793 20.5062 76.1267 22.4257 74.528 24.1994L77.4991 26.8775Z"
        fill="white"
      />
    </svg>
  );
}

function NavLink({ children, className = "", ...props }: LinkProps) {
  const resolved = useResolvedPath(props.to);
  const match = useMatch({ path: resolved.pathname, end: true });

  return (
    <Link {...props} className={match ? className + " active" : className}>
      {children}
    </Link>
  );
}

export function Nav() {
  return (
    <nav className="nav">
      <Link to="/">
        <Logo />
      </Link>
      <div className="nav-links">
        <NavLink className="nav-link" to="/">
          Send
        </NavLink>
        {/* <NavLink className="nav-link" to="/request">Request</NavLink> */}
        <NavLink className="nav-link" to="/about">
          About
        </NavLink>
        <a
          className="gh-link"
          href="https://github.com/rclarey/send"
          target="_blank"
          rel="noreferrer"
        >
          <svg
            className="gh-icon"
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <rect width="36" height="36" fill="url(#pattern0)" />
            <defs>
              <pattern
                id="pattern0"
                patternContentUnits="objectBoundingBox"
                width="1"
                height="1"
              >
                <use xlinkHref="#image0_7_3" transform="scale(0.00833333)" />
              </pattern>
              <image
                id="image0_7_3"
                width="120"
                height="120"
                xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NDkxMSwgMjAxMy8xMC8yOS0xMTo0NzoxNiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RERCMUIwQTM4NkNFMTFFM0FBNTJFRTMzNTJEMUJDNDYiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RERCMUIwQTI4NkNFMTFFM0FBNTJFRTMzNTJEMUJDNDYiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkU1MTc4QTMyOTlBMDExRTI5QTE1QkMxMDQ2QTg5MDREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjJBNDE0QUJDOTlBMTExRTI5QTE1QkMxMDQ2QTg5MDREIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+8kSqyAAADD5JREFUeNrsXQ2Q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"
              />
            </defs>
          </svg>
        </a>
      </div>
    </nav>
  );
}