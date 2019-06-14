import * as React from "react";
import { useAnimation } from "r-animated";

interface ICarouselProps
{
  slides: React.ReactElement[];
  duration?: number;
  animationDuration?: number;
  animationTimingFunction?: string;
  animationType?: "FADE" | "SLIDE_LEFT" | "SLIDE_RIGHT";
  animationDelay?: number;
  withNavigation?: boolean;
  customAnimation?: {
    active: {
      from: React.CSSProperties,
      to: React.CSSProperties
    },
    next: {
      from: React.CSSProperties,
      to: React.CSSProperties
    }
  }
}

interface ICarouselState
{
  active: number;
  nextActive: number;
  reset: boolean;
}

export default function Carousel(props: ICarouselProps): React.ReactElement
{
  let [state, dispatch] = React.useReducer(
    (state: ICarouselState, action: { type: string, index?: number }) =>
    {
      switch (action.type)
      {
        case "NEXT":
          return {
            active: state.nextActive,
            nextActive: (state.nextActive + 1) % props.slides.length,
            reset: !state.reset
          };
        case "BRING_NEXT":
          return {
            active: state.active,
            nextActive: state.nextActive,
            reset: !state.reset
          };
        case "CUSTOM":
          return {
            active: state.active,
            nextActive: action.index,
            reset: !state.reset
          };
        default:
          throw new Error();
      }
    },
    { active: -1, nextActive: 0, reset: false }
  );

  let activeStyles: React.CSSProperties = useAnimation({
    duration: props.animationDuration,
    timingFunction: props.animationTimingFunction,
    ...animationTypes[props.animationType] && animationTypes[props.animationType].active,
    ...props.customAnimation && props.customAnimation.active,
    delay: props.animationDelay || 100,
    reset: state.reset
  });

  let nextStyles: React.CSSProperties = useAnimation({
    duration: props.animationDuration,
    timingFunction: props.animationTimingFunction,
    ...animationTypes[props.animationType] && animationTypes[props.animationType].next,
    ...props.customAnimation && props.customAnimation.next,
    delay: props.animationDelay || 100,
    reset: state.reset
  });

  let timerId1 = React.useRef();
  let timerId2 = React.useRef();

  React.useEffect(() =>
  {
    timerId1.current = setTimeout(() =>
    {
      dispatch({ type: "NEXT" });
    }, props.duration || 1000);
    return () => clearTimeout(timerId1.current);
  }, [state.nextActive]);

  React.useEffect(() =>
  {
    timerId2.current = setTimeout(() =>
    {
      dispatch({ type: "BRING_NEXT" });
    }, props.duration || 1000);
    return () => clearTimeout(timerId2.current);
  }, [state.active]);

  function setIndex(index: number): void
  {
    clearTimeout(timerId1.current);
    clearTimeout(timerId2.current);
    dispatch({ type: "CUSTOM", index });
    timerId1.current = setTimeout(() =>
    {
      dispatch({ type: "NEXT" });
    }, props.duration || 1000);
  }

  return (
    <div style={styles.container} className="animated-carousel-container">
      <div style={{ ...styles.item, ...activeStyles }} className="animated-carousel-item">
        {props.slides[state.active]}
      </div>
      <div style={{ ...styles.item, ...nextStyles }} className="animated-carousel-item">
        {props.slides[state.nextActive]}
      </div>
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

let styles = {
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
