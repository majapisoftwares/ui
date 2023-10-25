import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import useEmblaCarousel, {
  EmblaOptionsType,
  EmblaPluginType,
} from "embla-carousel-react";
import clsx from "clsx";
import { ReactNode, useEffect, useState } from "react";
import Button from "../Button";
import { useMeasure } from "react-use";
import mergeRefs from "react-merge-refs";

export type CarouselProps = {
  children?: ReactNode;
  carouselClassName?: string;
  className?: string;
  navigation?: boolean;
  plugins?: EmblaPluginType[];
} & EmblaOptionsType;

export default function Carousel({
  children,
  className,
  carouselClassName,
  navigation,
  plugins,
  ...options
}: CarouselProps) {
  let [emblaRef, embla] = useEmblaCarousel(options, plugins);
  let [canScrollPrev, setCanScrollPrev] = useState(false);
  let [canScrollNext, setCanScrollNext] = useState(false);
  let [ref, { width, height }] = useMeasure();

  useEffect(() => {
    function updateCanScroll() {
      if (embla) {
        setCanScrollPrev(embla.canScrollPrev());
        setCanScrollNext(embla.canScrollNext());
      }
    }

    if (embla) {
      embla.reInit();
      updateCanScroll();
      embla.on("select", updateCanScroll);
      embla.on("reInit", updateCanScroll);
    }

    return () => {
      if (embla) {
        embla.off("select", updateCanScroll);
        embla.off("reInit", updateCanScroll);
      }
    };
  }, [embla, width, height]);

  return (
    <div data-axis={options.axis}>
      <div
        className={clsx("overflow-hidden", className)}
        ref={mergeRefs([ref, emblaRef])}
      >
        <div className={clsx("flex", carouselClassName)}>{children}</div>
        {navigation && (
          <div className="flex h-full">
            <Button
              icon
              variant="text"
              className={clsx({
                hidden: !canScrollPrev,
              })}
              disabled={!canScrollPrev}
              onClick={() => embla?.scrollPrev()}
            >
              <ChevronLeftIcon />
            </Button>
            <div className="flex-grow" />
            <Button
              icon
              variant="text"
              className={clsx({
                hidden: !canScrollNext,
              })}
              disabled={!canScrollNext}
              onClick={() => embla?.scrollNext()}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

Carousel.Slide = CarouselSlide;

export interface CarouselSlideProps {
  children?: ReactNode;
  className?: string;
}

function CarouselSlide({ children, className }: CarouselSlideProps) {
  return (
    <div className={clsx("min-w-0 flex-[0_0_auto]", className)}>{children}</div>
  );
}
