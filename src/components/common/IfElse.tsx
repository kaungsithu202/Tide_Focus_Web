import React from "react";

interface Props {
  isTrue: boolean;
  ifBlock: React.ReactNode;
  elseBlock: React.ReactNode;
}

const IfElse = ({ isTrue, ifBlock, elseBlock }: Props) => {
  return <>{isTrue ? ifBlock : elseBlock}</>;
};

export default IfElse;
