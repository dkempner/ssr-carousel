/** @jsxImportSource @emotion/react */
import { jsx } from "@emotion/react";
import facepaint from "facepaint";
import React, {
  PropsWithChildren,
  useState,
  useEffect,
  useRef,
  useMemo,
  MutableRefObject,
  useCallback,
  Ref,
} from "react";
import { useInView } from "react-intersection-observer";
import useSWR from "swr";
import ITEM_IDS from "../components/ITEM_IDS";

const mediaQueries = facepaint([
  "@media(min-width: 768px)",
  "@media(min-width: 1024px)",
  "@media(min-width: 1280px)",
]);

type Item = {
  id: string;
};
type InitialItems = Item[];
type InitialProps = {};

export const getServerSideProps = async () => {
  return {
    props: {},
  };
};

function Storefront({}: InitialProps) {
  return (
    <>
      <header
        css={{
          position: "sticky",
          top: 0,
          right: 0,
          left: 0,
          height: 80,
        }}
      >
        Header
      </header>
      <div
        css={{
          position: "fixed",
          width: 260,
          height: `calc(100% - 80px)`,
        }}
      >
        Side Nav
      </div>
      <div
        css={{
          height: "100%",
          marginLeft: 260,
          borderTop: "1px solid black",
          borderLeft: "1px solid black",
        }}
      >
        <Carousel itemIds={ITEM_IDS}></Carousel>
        <p></p>
        <Carousel itemIds={ITEM_IDS}></Carousel>
      </div>
    </>
  );
}

function Carousel({ itemIds }: { itemIds: string[] }) {
  const {
    visibleElements,
    visibilityList,
    offset,
    showPrevious,
    showNext,
    previousDisabled,
    nextDisabled,
  } = useWidthDetectingCarousel({
    items: itemIds.map((id) => ({ id })),
    serverRenderedMax: 20,
  });

  return (
    <div>
      <p>
        Currently Visible: {offset} -{" "}
        {offset + (visibilityList.current.size - 1)}
      </p>
      <div>
        <button onClick={showPrevious} disabled={previousDisabled}>
          Previous
        </button>
        <button onClick={showNext} disabled={nextDisabled}>
          Next
        </button>
      </div>
      <ul
        css={{
          listStyle: "none",
          overflowX: "hidden",
          whiteSpace: "nowrap",
          margin: 0,
          padding: 0,
        }}
      >
        {visibleElements?.map((item) => (
          <Item key={item.id} item={item} visibilityList={visibilityList} />
        ))}
      </ul>
    </div>
  );
}

const fetchById = (id: string) => {
  const url = `https://picsum.photos/id/${id}/info`;
  return fetch(url).then((res) => res.json());
};

function Item({
  item,
  visibilityList,
}: {
  item: Item;
  visibilityList: MutableRefObject<Set<string>>;
}) {
  const { data, error } = useSWR<Item>(item.id, fetchById, {});
  const id = data?.id;
  const downloadUrl = `https://picsum.photos/id/${id}/200`;

  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      visibilityList.current.add(item.id);
    }

    return () => {
      visibilityList.current.delete(item.id);
    };
  }, [inView, item.id, visibilityList]);

  return (
    <li
      ref={inViewRef}
      className={inView ? "visible" : ""}
      css={mediaQueries({
        display: "inline-block",
        width: ["50%", "25%", "20%", "12.5%"],
      })}
    >
      {/* eslint-disable-next-line  @next/next/no-img-element, jsx-a11y/alt-text */}
      <img
        css={{ width: "100%", height: 100 }}
        src={downloadUrl}
        loading="lazy"
      />
      <p>{id}</p>
    </li>
  );
}

const itemsFetcher = (url: string) => {
  return fetch(url).then((res) => res.json());
};

type UseWidthDetectingCarouselProps = {
  items: Item[];
  serverRenderedMax: number;
};

function useWidthDetectingCarousel({
  items,
  serverRenderedMax,
}: UseWidthDetectingCarouselProps) {
  const visibilityList = useRef(new Set<string>());
  const [offset, setOffset] = useState(0);

  const paddedItems = useMemo<Item[]>(() => {
    return Array(20)
      .fill(true)
      .map((item, idx) => {
        return {
          id: `padding-${idx}`,
        };
      });
  }, []);

  const visibleElements = useMemo(() => {
    const withPadding = items.concat(paddedItems);
    return withPadding.slice(offset, offset + serverRenderedMax);
  }, [items, offset, paddedItems, serverRenderedMax]);

  const showPrevious = useCallback(() => {
    const visibleCount = visibilityList.current.size;
    const desired = offset - visibleCount;
    setOffset(desired >= 0 ? desired : 0);
  }, [offset]);

  const showNext = useCallback(() => {
    const visibleCount = visibilityList.current.size;
    setOffset(offset + visibleCount);
  }, [offset]);

  const previousDisabled = useMemo(() => {
    return offset === 0;
  }, [offset]);

  const nextDisabled = useMemo(() => {
    return (
      visibilityList.current.size > visibleElements.length - paddedItems.length
    );
  }, [visibleElements.length, paddedItems.length]);

  return {
    visibleElements,
    visibilityList,
    offset,
    showPrevious,
    showNext,
    previousDisabled,
    nextDisabled,
  };
}

export default Storefront;
