'use client'
import { useState } from "react";
import { ClickAwayListener, Tooltip, Button } from "@mui/material";
import HelpOutlineTwoToneIcon from '@mui/icons-material/HelpOutlineTwoTone';

export default function ToolTipCustom({toolTipName}: any) {
    const [toolTipOpen, setToolTipOpen] = useState<string | null>(null);
    const handleTooltipClose = (name: string) => {
      if (toolTipOpen === name) setToolTipOpen(null);
    };
  
    const handleTooltipOpen = (name: string) => {
      setToolTipOpen(name);
    };
  
  return (
    <ClickAwayListener onClickAway={() => handleTooltipClose(toolTipName)}>
        <div>
          <Tooltip
            sx={{
              textTransform: "none",
              padding: 0,
              textAlign:'left',
              color: "black",
              fontSize: "15px",
            }}
            PopperProps={{
              disablePortal: true,
            }}
            onClose={() => handleTooltipClose(toolTipName)}
            open={toolTipOpen === toolTipName}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title="lorem ipsum"
            arrow
          >
            
              <div>
                  {toolTipName==='preTrained'? <div className="flex gap-1 items-center">
                    <div>Pre-trained document templates</div> <div className="text-[#1976D2]">
                        <Button size="small" sx={{textTransform: 'none'}}  onClick={() => handleTooltipOpen(toolTipName)}>
                        (see list)
                        </Button>
                        </div>
                  </div>
                  
                  :toolTipName==='uiSandbox'?
                  <div className="flex gap-1 items-center">
                    <div>UI Sandbox</div><div>
                        <Button size="small" sx={{textTransform: 'none'}}  onClick={() => handleTooltipOpen(toolTipName)}>
                        <HelpOutlineTwoToneIcon color="primary" sx={{fontSize:'20px', display:'flex', alignSelf:'center'}}/>
                        </Button>
                        </div>
                  </div>
                  
                  : toolTipName==='image'?
                  <div className="flex gap-1 items-center">
                    <div>Image intelligence</div><div>
                        <Button size="small" sx={{textTransform: 'none'}}  onClick={() => handleTooltipOpen(toolTipName)}>
                        <HelpOutlineTwoToneIcon color="primary" sx={{fontSize:'20px', display:'flex', alignSelf:'center'}}/>
                        </Button>
                        </div>
                  </div>
    
                  :toolTipName==='docClassification'?
                  <div className="flex gap-1 items-center">
                    <div>Document classification</div><div>
                        <Button size="small" sx={{textTransform: 'none'}}  onClick={() => handleTooltipOpen(toolTipName)}>
                        <HelpOutlineTwoToneIcon color="primary" sx={{fontSize:'20px', display:'flex', alignSelf:'center'}}/>
                        </Button>
                        </div>
                  </div>
            
                  :toolTipName==='customTraining'?
                  <div className="flex gap-1 items-center">
                  <div>Custom training</div><div>
                      <Button size="small" sx={{textTransform: 'none'}}  onClick={() => handleTooltipOpen(toolTipName)}>
                      <HelpOutlineTwoToneIcon color="primary" sx={{fontSize:'20px', display:'flex', alignSelf:'center'}}/>
                      </Button>
                      </div>
                </div>
                  
                  : ''
                }
                </div>
            
          </Tooltip>
        </div>
      </ClickAwayListener>
  );
}