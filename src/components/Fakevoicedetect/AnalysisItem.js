import React from "react";
import "../../style.css";

const AnalysisItem = (props) => {
  // console.log(props.data);
  // const toRemove = "\n";
  // const newString = props.data
  //   .replaceAll(new RegExp(toRemove, "g"), "")
  //   .split(":");
  const newString = props.data.split("ENDHEADLINE!!!");
  return (
    <div className="analysisItem">
      <div className="analysisItem--header">
        <strong>{newString[0]}</strong>
      </div>
      <div className="analysisItem--content">
        {newString[1]?.split("\n").map((s) => {
          if (s != "")
            return (
              <div>
                {(s[0] == '*' || s[0] == '-' || s[0] == '+') ? <span style={{ paddingLeft: "2.5em" }}></span> : <span></span>}
                {s}
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default AnalysisItem;
