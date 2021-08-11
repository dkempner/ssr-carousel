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
import { useSWRInfinite } from "swr";

const mediaQueries = facepaint([
  "@media(min-width: 768px)",
  "@media(min-width: 1024px)",
  "@media(min-width: 1280px)",
]);

type Item = {
  download_url: string;
  id: string;
};
type InitialItems = Item[];
type InitialProps = {
  initialItems: InitialItems;
};

export const getServerSideProps = async () => {
  const initialItems: InitialItems = await itemsFetcher(
    "https://picsum.photos/v2/list?page=1"
  );
  return {
    props: {
      initialItems,
    },
  };
};

function Storefront({ initialItems }: InitialProps) {
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
        <Carousel initialItems={initialItems}></Carousel>
        <p></p>
        <Carousel initialItems={initialItems}></Carousel>
      </div>
    </>
  );
}

function Carousel({ initialItems }: { initialItems: InitialItems }) {
  const visiblesRef = useRef(new Set<string>());
  const { data, error, mutate, size, setSize, isValidating } = useSWRInfinite<
    Item[]
  >(
    (pageIndex) => `https://picsum.photos/v2/list?page=${pageIndex + 1}`,
    itemsFetcher
  );

  const [offset, setOffset] = useState(0);

  const paddedItems = useMemo<Item[]>(() => {
    return Array(20)
      .fill(true)
      .map((item, idx) => ({
        id: `padding-${idx}`,
        download_url: "",
      }));
  }, []);

  const visibleItems = useMemo(() => {
    const k = data?.length
      ? data.flat().map((i) => ({
          ...i,
          download_url: `https://picsum.photos/id/${i.id}/200.jpg`,
        }))
      : initialItems;
    return k?.slice(offset).concat(paddedItems);
  }, [data, initialItems, offset, paddedItems]);

  useEffect(() => {
    const highestShown = offset + visiblesRef.current.size - 1;
    if (!data) return;

    // if we only have 10 more to go, let's fetch the next batch of 30
    if (data.flat().length - highestShown < 10) {
      setSize((size) => size + 1);
    }
  }, [offset, data, setSize]);

  const previous = () => {
    const visibleCount = visiblesRef.current.size;
    const desired = offset - visibleCount;
    setOffset(desired >= 0 ? desired : 0);
  };

  const next = () => {
    const visibleCount = visiblesRef.current.size;
    setOffset(offset + visibleCount);
  };

  return (
    <div>
      <p>
        Currently Visible: {offset} - {offset + (visiblesRef.current.size - 1)}
      </p>
      <div>
        <button onClick={previous} disabled={offset === 0}>
          Previous
        </button>
        <button
          onClick={next}
          disabled={
            visiblesRef.current.size > visibleItems.length - paddedItems.length
          }
        >
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
        {visibleItems?.map((item) => (
          <Item key={item.id} item={item} visiblesRef={visiblesRef} />
        ))}
      </ul>
    </div>
  );
}

function Item({
  item,
  visiblesRef,
}: {
  item: Item;
  visiblesRef: MutableRefObject<Set<string>>;
}) {
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      visiblesRef.current.add(item.id);
    }

    return () => {
      visiblesRef.current.delete(item.id);
    };
  }, [inView, item.id, visiblesRef]);

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
        src={item.download_url}
        loading="lazy"
      />
      <p>{item.id}</p>
    </li>
  );
}

const itemsFetcher = (url: string) => {
  return fetch(url).then((res) => res.json());
};

export default Storefront;
