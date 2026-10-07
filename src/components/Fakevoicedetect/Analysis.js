import React from "react";
import AnalysisItem from "./AnalysisItem";
import "../../style.css";

const Analysis = (props) => {
  // console.log(props.aiAnalysis);
  const analysis = props.aiAnalysis.split("ENDPARAGRAPH!!!");
  // console.log(analysis);

  return (
    <div className="analysis">
      {analysis.map((analysisItem) => {
        if (analysisItem != "") return <AnalysisItem data={analysisItem} />;
      })}
    </div>
  );
};

export default Analysis;
