import * as React from "react";
import { Animated } from "r-animated";

interface ICarouselProps {
  slides: React.ReactElement[];
  duration?: number;
  animationDuration?: number;
  animationTimingFunction?: string;
  animationType?: "FADE" | "SLIDE_LEFT" | "SLIDE_RIGHT";
  animationDelay?: number;
  withNavigation?: boolean;
  customAnimation?: {
    active: {
      from: React.CSSProperties;
      to: React.CSSProperties;
    };
    next: {
      from: React.CSSProperties;
      to: React.CSSProperties;
    };
  };
  animateOnMount?: boolean;
}

interface ICarouselState {
  active: number;
  nextActive: number;
  animate: boolean;
}

export default function Carousel(props: ICarouselProps): React.ReactElement {
  let [state, dispatch] = React.useReducer(
    (state: ICarouselState, action: { type: string; index?: number }) => {
      switch (action.type) {
        case "NEXT":
          return {
            active: state.nextActive,
            nextActive: (state.nextActive + 1) % props.slides.length,
            animate: true
          };
        case "BRING_NEXT":
          return {
            active: state.active,
            nextActive: state.nextActive,
            animate: true
          };
        case "CUSTOM":
          return {
            active: state.nextActive,
            nextActive: action.index,
            animate: true
          };
        default:
          throw new Error();
      }
    },
    { active: -1, nextActive: 0, animate: !!props.animateOnMount }
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

  React.useEffect(() => {
    clearTimeout(timerId2.current);
    timerId2.current = setTimeout(() => {
      dispatch({ type: "BRING_NEXT" });
    }, props.duration || 1000);
    return () => clearTimeout(timerId2.current);
  }, [state.active, props.duration]);

  function setIndex(index: number): void {
    clearTimeout(timerId1.current);
    clearTimeout(timerId2.current);
    dispatch({ type: "CUSTOM", index });
    timerId1.current = setTimeout(() => {
      dispatch({ type: "BRING_NEXT" });
    }, props.duration || 1000);
  }

  return (
    <div
      style={styles.container}
      className="animated-carousel-container"
      key={state.nextActive + 10}
    >
      <Animated
        duration={props.animationDuration}
        timingFunction={props.animationTimingFunction}
        {...animationTypes[props.animationType] &&
          animationTypes[props.animationType].active}
        {...props.customAnimation && props.customAnimation.active}
        delay={props.animationDelay || 100}
      >
        {style => (
          <div
            style={{ ...styles.item, ...(state.animate && style) }}
            className="animated-carousel-item"
          >
            {props.slides[state.active]}
          </div>
        )}
      </Animated>
      <Animated
        duration={props.animationDuration}
        timingFunction={props.animationTimingFunction}
        {...animationTypes[props.animationType] &&
          animationTypes[props.animationType].next}
        {...props.customAnimation && props.customAnimation.next}
        delay={props.animationDelay || 100}
      >
        {style => (
          <div
            style={{ ...styles.item, ...(state.animate && style) }}
            className="animated-carousel-item"
          >
            {props.slides[state.nextActive]}
          </div>
        )}
      </Animated>
      {props.withNavigation ? (
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
      ) : null}
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
    height: "100%"
  }
};

const animationTypes = {
  FADE: {
    active: {
      from: { opacity: 1 },
      to: { opacity: 0 }
    },
    next: {
      from: { opacity: 0.19 },
      to: { opacity: 1 }
    }
  },
  SLIDE_LEFT: {
    active: {
      from: { transform: "translateX(0)" },
      to: { transform: "translateX(-100%)" }
    },
    next: {
      from: { transform: "translateX(100%)" },
      to: { transform: "translateX(0%)" }
    }
  },
  SLIDE_RIGHT: {
    active: {
      from: { transform: "translateX(0)" },
      to: { transform: "translateX(100%)" }
    },
    next: {
      from: { transform: "translateX(-100%)" },
      to: { transform: "translateX(0%)" }
    }
  }
};