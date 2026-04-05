interface Action {
    type: string;
    displayName: string;
    displayIcon: string;
    displayStructure: string;
    args: Array<{
      key: string;
      description: string;
      options?: string[];
    }>;
  }
  
interface Actions {
    [key: string]: Action;
  }
export const actions: Actions = {
    "ai_click": {
      "displayName": "Click",
      "displayIcon": "/assets/click.svg",
      "displayStructure": "Click on [prompt]",
      "type": "AI",
      "args": []
    },
    "ai_hover": {
      "displayName": "Hover",
      "displayIcon": "/assets/hover.svg",
      "displayStructure": "Hover on [prompt]",
      "type": "AI",
      "args": []
    },
    "ai_select": {
      "displayName": "Select",
      "displayIcon": "/assets/select.svg",
      "displayStructure": "Select [value] from [prompt]",
      "type": "AI",
      "args": [
        {
          "key": "value",
          "description": "Enter a value"
        }
      ]
    },
    // "ai_switch_tab": {
    //   "type": "AI",
    //   "args": [
    //     {
    //       "key": "url",
    //       "description": "URL to navigate to"
    //     }
    //   ]
    // },
    "ai_input": {
      "displayName": "Input",
      "displayIcon": "/assets/type.svg",
      "displayStructure": "Input [value] in [prompt]",
      "type": "AI",
      "args": [
        {
          "key": "value",
          "description": "Enter a value"
        }
      ]
    },
    "ai_file_upload": {
      "displayName": "Upload File",
      "displayIcon": "/assets/upload.svg",
      "displayStructure": "Upload [file_name] in [prompt]",
      "type": "AI",
      "args": [
        {
          "key": "file_id",
          "description": "Select a file"
        }
      ]
    },
    "ai_assert": {
      "displayName": "Verify with AI",
      "displayIcon": "/assets/goal-btn.svg",
      "displayStructure": "Verify with AI [prompt]",
      "type": "AI",
      "args": [
        {
          "key": "fail_test",
          "description": "Fail test on verification failure?"
        },
        {
          "key": "expected_result",
          "description": "Expected result"
        }
      ]
    },
    "go_back": {
      "displayName": "Go Back",
      "displayIcon": "/assets/back.svg",
      "displayStructure": "Go back to last page",
      "type": "Non-AI",
      "args": []
    },
    "go_to_url": {
      "displayName": "Go to URL",
      "displayIcon": "/assets/url.svg",
      "displayStructure": "Go to URL [url]",
      "type": "Non-AI",
      "args": [
        {
          "key": "url",
          "description": "URL to navigate to"
        }
      ]
    },
    "verify":{
    "displayName": "Verify",
    "displayIcon": "/assets/verify.svg",
    "displayStructure": "Verify [target]: [prompt]: [property] [check] [value]",
    "type": "Non-AI",
    "args": [{
      "key": "target",
      "description": "Select target to verify"
    },
    {
      "key": "locator_type",
      "description": "Choose locator type"
    },
    {
      "key": "prompt",
      "description": "Prompt to find the element"
    },
    {
      "key": "locator",
      "description": "Enter CSS/XPATH locator"
    },
    {
      "key": "property",
      "description": "Select what to verify"
    },
    {
      "key": "check",
      "description": "Select check type"
    },
    {
      "key": "sub_property",
      "description": "Enter sub property"
    },
    {
      "key": "value",
      "description": "Enter value"
    },
    {
      "key": "fail_test",
      "description": "Fail test on verification failure?"
    },
    {
      "key": "expected_result",
      "description": "Expected result"
    }
    ]
  },
    "wait_time": {
      "displayName": "Wait Time (seconds)",
      "displayIcon": "/assets/wait.svg",
      "displayStructure": "Wait for [delay_seconds] seconds",
      "type": "Non-AI",
      "args": [
        {
          "key": "delay_seconds",
          "description": "Time to wait in seconds"
        }
      ]
    },
    "open_tab": {
      "displayName": "New Tab",
      "displayIcon": "/assets/new-tab.svg",
      "displayStructure": "Open a new tab with [url]",
      "type": "Non-AI",
      "args": [
        {
          "key": "url",
          "description": "URL to navigate to"
        }
      ]
    },
    "switch_tab": {
      "displayName": "Switch Tab",
      "displayIcon": "/assets/switch.svg",
      "displayStructure": "Switch to tab with [url]",
      "type": "Non-AI",
      "args": [
        {
          "key": "url",
          "description": "URL to switch to"
        }
      ]
    },
    "run_script": {
      "displayName": "Run Script",
      "displayIcon": "/assets/script.svg",
      "displayStructure": "Run script [description]",
      "type": "Non-AI",
      "args": [
        {
          "key": "description",
          "description": "About the script"
        },
        {
          "key": "script",
          "description": "Script to run"
        }
      ]
    },
    "ai_script": {
      "displayName": "Script (AI generated)",
      "displayIcon": "/assets/script.svg",
      "displayStructure": "Script (AI generated) [description]",
      "type": "AI",
      "args": [
        {
          "key": "description",
          "description": "About the script"
        },
        {
          "key": "prompt",
          "description": "Prompt for AI script generation"
        }
      ]
    },
    "reuse_test": {
    "displayName": "Reuse Test",
    "displayIcon": "/assets/reuse.svg",
    "displayStructure": "Reuse test [test_name]",
    "type": "Test-Segment",
    "args": [
      {
        "key": "source_test_id",
        "description": "Source test ID"
      },
      {
        "key": "test_name",
        "description": "Test name"
      }
    ]
  },
  "scroll": {
    "displayName": "Scroll",
    "displayIcon": "/assets/scroll.svg",
    "displayStructure": "Scroll [direction] by [value] pixels",
    "type": "Non-AI",
    "args": [
      {
        "key": "direction",
        "description": "Direction to scroll",
        "options": ["up", "down", "right", "left"]
      },
      {
        "key": "value",
        "description": "Number of pixels to scroll"
      }
    ]
  },
  "set_state_variable": {
    "displayName": "Set State Variable",
    "displayIcon": "/assets/script.svg",
    "displayStructure": "Set state variable [variable_name] to [variable_value]",
    "type": "Non-AI",
    "args": [
      {
        "key": "variable_name",
        "description": "Variable name"
      },
      {
        "key": "variable_value",
        "description": "Variable value"
      }
    ]
  },
  "key_press": {
    "displayName": "Key Press",
    "displayIcon": "/assets/type.svg",
    "displayStructure": "Key [key_type]: [value]",
    "type": "Non-AI",
    "args": [
      {
        "key": "key_type",
        "description": "Key type to press",
        "options": ["up", "down", "press"]
      },
      {
        "key": "value",
        "description": "Value to press e.g. 'o', 'Control+c', 'Shift'"
      }
    ]
  },
  "page_reload": {
    "displayName": "Page Reload",
    "displayIcon": "/assets/reuse.svg",
    "displayStructure": "Reload the current page",
    "type": "Non-AI",
    "args": []
  },
  "api_intercept": {
    "displayName": "Intercept API Request / Response",
    "displayIcon": "/assets/api.svg",
    "displayStructure": "Intercept API [method] [url] [action] → [variable_name]",
    "type": "Non-AI",
    "args": [
      {
        "key": "url",
        "description": "URL (string or glob pattern)"
      },
      {
        "key": "method",
        "description": "HTTP Method",
        "options": ["GET", "POST", "PUT", "PATCH", "DELETE"]
      },
      {
        "key": "action",
        "description": "Action",
        "options": ["modify_request", "modify_response", "abort_request", "record_only"]
      },
      {
        "key": "js_code",
        "description": "JavaScript code"
      },
      {
        "key": "variable_name",
        "description": "Variable name"
      }
    ]
  },
  "api_mock": {
    "displayName": "Mock API Response",
    "displayIcon": "/assets/api.svg",
    "displayStructure": "Mock API [method] [url] [status_code]",
    "type": "Non-AI",
    "args": [
      {
        "key": "url",
        "description": "URL (string or glob pattern)"
      },
      {
        "key": "method",
        "description": "HTTP Method",
        "options": ["GET", "POST", "PUT", "PATCH", "DELETE"]
      },
      {
        "key": "status_code",
        "description": "Status Code"
      },
      {
        "key": "response_header",
        "description": "Response header (JSON)"
      },
      {
        "key": "response_body",
        "description": "Response body (JSON)"
      }
    ]
  },
  "remove_api_handlers": {
    "displayName": "Remove API Handlers",
    "displayIcon": "/assets/api.svg",
    "displayStructure": "Remove API handlers [url]",
    "type": "Non-AI",
    "args": [
      {
        "key": "url",
        "description": "URL (string or glob pattern)"
      }
    ]
  }

  };