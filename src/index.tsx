import * as React from "react";
import { Animated } from "r-animated";

interface ICarouselProps
{
  slides: React.ReactElement[];
  duration?: number;
  animationDuration?: number;
  animationTimingFunction?: string;
  animationType?: "fade" | "slideLeft" | "slideRight";
  animationDelay?: number;
  customAnimation?: {
    active: {
      from: React.CSSProperties,
      to: React.CSSProperties
    },
    next: {
      from: React.CSSProperties,
      to: React.CSSProperties}
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
    (state: ICarouselState, action: { type: string }) =>
    {
      switch (action.type)
      {
        case "next":
          return {
            active: state.nextActive,
            nextActive: (state.nextActive + 1) % props.slides.length,
            reset: !state.reset
          };
        case "bringNext":
          return {
            active: state.active,
            nextActive: state.nextActive,
            reset: !state.reset
          };
        default:
          throw new Error();
      }
    },
    { active: -1, nextActive: 0, reset: false }
  );
  React.useEffect(() =>
  {
    let timerId = setTimeout(() =>
    {
      clearTimeout(timerId);
      dispatch({ type: "next" });
    }, props.duration || 1000);
    return () =>
    {
      clearTimeout(timerId);
    };
  }, [state.nextActive]);
  React.useEffect(() =>
  {
    let timerId = setTimeout(() =>
    {
      clearTimeout(timerId);
      dispatch({ type: "bringNext" });
    }, props.duration || 1000);
    return () =>
    {
      clearTimeout(timerId);
    };
  }, [state.active]);
  return (
    <div style={styles.container} className="animated-carousel-container">
      <Animated
        duration={props.animationDuration}
        timingFunction={props.animationTimingFunction}
        {...animationTypes[props.animationType] &&
        animationTypes[props.animationType].active}
        {...props.customAnimation && props.customAnimation.active}
        delay={props.animationDelay || 100}
        reset={state.reset}
      >
        {style => (
          <div style={{ ...styles.item, ...style }} className="animated-carousel-item">
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
        reset={state.reset}
      >
        {(style: React.CSSProperties) => (
          <div style={{ ...styles.item, ...style }} className="animated-carousel-item">
            {props.slides[state.nextActive]}
          </div>
        )}
      </Animated>
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
  fade: {
    active: {
      from: { opacity: 1 },
      to: { opacity: 0 }
    },
    next: {
      from: { opacity: 0.19 },
      to: { opacity: 1 }
    }
  },
  slideLeft: {
    active: {
      from: { transform: "translateX(0)" },
      to: { transform: "translateX(-100%)" }
    },
    next: {
      from: { transform: "translateX(100%)" },
      to: { transform: "translateX(0%)" }
    }
  },
  slideRight: {
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
