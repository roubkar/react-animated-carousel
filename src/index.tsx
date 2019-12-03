import * as React from "react";

interface ICarouselProps {
  slides: React.ReactElement[];
  chachedSlides?: boolean;
  duration?: number;
  animationDuration?: number;
  animationTimingFunction?: string;
  animationType?: "FADE" | "SLIDE" | "ZOOM" | "NO";
  animationDelay?: number;
  withNavigation?: boolean;
}

interface ICarouselState {
  active: number;
  nextActive: number;
}

export default function Carousel(props: ICarouselProps): React.ReactElement {
  let [state, dispatch] = React.useReducer(
    (state: ICarouselState, action: { type: string; index?: number }) => {
      switch (action.type) {
        case "NEXT":
          return {
            active: state.nextActive,
            nextActive: (state.nextActive + 1) % props.slides.length
          };
        case "CUSTOM":
          return {
            active: state.nextActive,
            nextActive: action.index
          };
        default:
          throw new Error();
      }
    },
    { active: -1, nextActive: 0 }
  );

  let timerId1: React.MutableRefObject<number> = React.useRef();
  let timerId2: React.MutableRefObject<number> = React.useRef();

  React.useEffect(() => {
    clearTimeout(timerId1.current);
    timerId1.current = setTimeout(() => {
      dispatch({ type: "NEXT" });
    }, props.duration || 1000);
    return () => clearTimeout(timerId1.current);
  }, [state.nextActive, props.duration]);

  function setIndex(index: number): void {
    clearTimeout(timerId1.current);
    clearTimeout(timerId2.current);
    dispatch({ type: "CUSTOM", index });
    timerId1.current = setTimeout(() => {
      dispatch({ type: "BRING_NEXT" });
    }, props.duration || 1000);
  }

  return (
    <div style={styles.container} className="animated-carousel-container">
      {props.slides.map((slide, index) => (
        <div
          key={index}
          style={{
            ...styles.item,
            ...getAnimationStyle({
              index,
              activeIndex: state.active,
              nextActiveIndex: state.nextActive,
              animationType: props.animationType,
              duration: props.animationDuration,
              timingFunction: props.animationTimingFunction,
              animationDelay: props.animationDelay
            })
          }}
          className="animated-carousel-item"
        >
          {slide}
        </div>
      ))}
      {props.withNavigation && (
        <div className="animated-carousel-dots">
          {props.slides.map((slide, index) => (
            <button
              key={`${index}`}
              className={`animated-carousel-dot ${
                index === state.nextActive ? "active" : ""
              }`}
              onClick={(e: React.SyntheticEvent) => setIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

let styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    height: "100%"
  },
  item: {
    position: "absolute",
    width: "100%",
    height: "100%",
    objectFit: "cover"
  }
};

function getAnimationStyle({
  index,
  activeIndex,
  nextActiveIndex,
  animationType,
  duration,
  timingFunction,
  animationDelay
}) {
  let style;
  switch (animationType) {
    case "FADE":
      style = {
        opacity: nextActiveIndex === index ? 1 : 0
      };
      break;
    case "SLIDE":
      style = {
        transform: `translateX(${(index - nextActiveIndex) * 100}%)`
      };
      break;
    case "ZOOM":
      style = {
        transform: `scale(${nextActiveIndex === index ? 1 : 2})`,
        opacity: nextActiveIndex === index ? 1 : 0
      };
      break;
    case "NO":
      style = {
        opacity: nextActiveIndex === index ? 1 : 0,
        transition: "none"
      };
      break;
    default:
      style = {};
  }

  return {
    transition: `all ${(duration || 700) / 1000}s  ${timingFunction ||
      "cubic-bezier(0.1, 0.99, 0.1, 0.99)"} ${(animationDelay || 100) / 1000}s`,
    ...style,
  };
}
