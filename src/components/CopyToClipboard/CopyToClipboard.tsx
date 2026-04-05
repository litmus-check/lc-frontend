import { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Tooltip from '@mui/material/Tooltip';

const CopyToClipboard = ({ text }: { text : string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(text);
    } else {
      document.execCommand('copy', true, text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <button onClick={handleCopy}>
        <Tooltip title={`${copied ? 'Copied' : 'Copy snippet'}`}>
            <ContentCopyIcon fontSize='small' />
        </Tooltip>
      </button>
    </div>
  );
};

export default CopyToClipboard;
