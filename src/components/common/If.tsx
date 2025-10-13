import React from "react";

interface Props {
  isTrue: boolean;
  ifBlock: React.ReactNode;
}

const If = ({ isTrue, ifBlock }: Props) => {
  return <>{isTrue ? ifBlock : null}</>;
};

export default If;
