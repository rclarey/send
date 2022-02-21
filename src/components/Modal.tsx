import { createPortal } from "react-dom";
import { useTransition, animated } from "@react-spring/web";

import "./Modal.css";

interface Props {
  action: () => void;
  close: () => void;
  visible: boolean;
}

export function DeleteModal({ action, close, visible }: Props) {
  const transition = useTransition(visible, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { tension: 800, clamp: true },
  });

  return createPortal(
    transition(
      (style, show, t) =>
        show && (
          <animated.div style={style} className="modal_positioner">
            <div className="modal_backdrop" onClick={() => close()} />
            <div className="modal">
              <p className="modal_title">Are you sure?</p>
              <p className="modal_body">
                If you delete this file it will be gone forever.
              </p>
              <div className="modal_buttons">
                <button
                  className="modal_action"
                  onClick={() => {
                    if (t.phase !== "leave") {
                      action();
                      close();
                    }
                  }}
                >
                  Delete
                </button>
                <button
                  className="modal_cancel"
                  onClick={() => {
                    if (t.phase !== "leave") {
                      close();
                    }
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </animated.div>
        )
    ),
    document.getElementById("root")!
  );
}
