import React from "react";

type Props = { pdfUrl: string };

const PDFViewer = ({ pdfUrl }: Props) => {
  return (
    <>
      <iframe
        key={pdfUrl}
        src={`https://docs.google.com/gview?url=${pdfUrl}&embedded=true`}
        className="h-full w-full border-0"
      />
    </>
  );
};

export default PDFViewer;
