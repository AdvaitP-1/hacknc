import React from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { ArrowRight } from "lucide-react";

export const RevealBento = () => {
  return (
    <div className="px-4 py-12 text-zinc-900">
      <motion.div
        initial="initial"
        animate="animate"
        transition={{
          staggerChildren: 0.05,
        }}
        className="mx-auto grid max-w-4xl grid-flow-dense grid-cols-12 gap-4"
      >
        <HeaderBlock />
        <FeaturesBlock />
        <AboutBlock />
      </motion.div>
    </div>
  );
};

const Block = ({ className, ...rest }) => {
  return (
    <motion.div
      variants={{
        initial: {
          scale: 0.5,
          y: 50,
          opacity: 0,
        },
        animate: {
          scale: 1,
          y: 0,
          opacity: 1,
        },
      }}
      transition={{
        type: "spring",
        mass: 3,
        stiffness: 400,
        damping: 50,
      }}
      className={twMerge(
        "col-span-4 rounded-lg border border-zinc-700 bg-white p-6",
        className
      )}
      {...rest}
    />
  );
};

const HeaderBlock = () => (
  <Block className="col-span-12 row-span-2 md:col-span-6">
    <div className="mb-4 size-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <span className="text-2xl font-bold text-white">SS</span>
    </div>
    <h1 className="mb-12 text-4xl font-medium leading-tight">
      Study Share.{" "}
      <span className="text-zinc-600 font-medium">
        Where students share knowledge and succeed together.
      </span>
    </h1>
    <a
      href="#"
      className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
    >
      Join our community <ArrowRight />
    </a>
  </Block>
);

const FeaturesBlock = () => (
  <>
    <Block
      whileHover={{
        rotate: "2.5deg",
        scale: 1.1,
      }}
      className="col-span-6 bg-blue-500 md:col-span-3"
    >
      <div className="grid h-full place-content-center text-center">
        <div className="text-3xl mb-2">📚</div>
        <div className="text-sm font-medium">Share Notes</div>
      </div>
    </Block>
    <Block
      whileHover={{
        rotate: "-2.5deg",
        scale: 1.1,
      }}
      className="col-span-6 bg-green-600 md:col-span-3"
    >
      <div className="grid h-full place-content-center text-center">
        <div className="text-3xl mb-2">💬</div>
        <div className="text-sm font-medium">Forums</div>
      </div>
    </Block>
    <Block
      whileHover={{
        rotate: "-2.5deg",
        scale: 1.1,
      }}
      className="col-span-6 bg-purple-600 md:col-span-3"
    >
      <div className="grid h-full place-content-center text-center">
        <div className="text-3xl mb-2">👍</div>
        <div className="text-sm font-medium">Upvote</div>
      </div>
    </Block>
    <Block
      whileHover={{
        rotate: "2.5deg",
        scale: 1.1,
      }}
      className="col-span-6 bg-orange-500 md:col-span-3"
    >
      <div className="grid h-full place-content-center text-center">
        <div className="text-3xl mb-2">🎓</div>
        <div className="text-sm font-medium">College</div>
      </div>
    </Block>
  </>
);

const AboutBlock = () => (
  <Block className="col-span-12 text-3xl leading-snug">
    <p className="font-medium">
      Connect with your college community.{" "}
      <span className="text-zinc-600 font-medium">
        Upload your class notes, join study forums, and help fellow students succeed. 
        Our upvote system ensures the best resources rise to the top, making it easier 
        for everyone to find quality study materials for their courses.
      </span>
    </p>
  </Block>
);

