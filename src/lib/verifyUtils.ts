/**
 * Utility functions for verify action logic
 */

/**
 * Determines if a verify action field should be skipped during validation
 * @param argKey - The argument key to check
 * @param instructionArgs - The current instruction arguments
 * @returns true if the field should be skipped during validation
 */
export const shouldSkipVerifyValidation = (argKey: string, instructionArgs: any): boolean => {
  // Skip locator-related args if target is 'page'
  if (instructionArgs.target === 'page' && 
      (argKey === 'locator_type' || argKey === 'prompt' || argKey === 'locator')) {
    return true;
  }
  // Skip sub-property args if target is 'page'
  if (instructionArgs.target === 'page' && 
      (argKey === 'sub_property' || argKey === 'value')) {
    return true;
  }
  // Skip sub-property args if property is not 'Verify attribute' or 'Verify css'
  if ((argKey === 'sub_property' || argKey === 'value') && 
      instructionArgs.property !== 'verify_attribute' && 
      instructionArgs.property !== 'verify_css') {
    return true;
  }
  // Skip locator field if locator_type is 'ai'
  if (argKey === 'locator' && instructionArgs.locator_type === 'ai') {
    return true;
  }
  // Skip prompt field if locator_type is not 'ai'
  if (argKey === 'prompt' && instructionArgs.locator_type !== 'ai') {
    return true;
  }
  // Skip check and value fields if property is a "verify_if_*" option
  if ((argKey === 'check' || argKey === 'value') && 
      instructionArgs.property && 
      instructionArgs.property.startsWith('verify_if_')) {
    return true;
  }
  // Skip validation for value if property is verify_attribute (it's optional)
  if (argKey === 'value' && instructionArgs.property === 'verify_attribute') {
    return true;
  }
  return false;
};

/**
 * Determines if a verify action field should be included in the API payload
 * @param argKey - The argument key to check
 * @param instructionArgs - The current instruction arguments
 * @returns true if the field should be included in the payload
 */
export const shouldIncludeVerifyArg = (argKey: string, instructionArgs: any): boolean => {
  // Skip locator-related args if target is 'page'
  if (instructionArgs.target === 'page' && 
      (argKey === 'locator_type' || argKey === 'prompt' || argKey === 'locator')) {
    return false;
  }
  // Skip sub-property args if target is 'page'
  if (instructionArgs.target === 'page' && 
      argKey === 'sub_property') {
    return false;
  }
  // Skip sub-property args if property is not 'Verify attribute' or 'Verify css'
  if (argKey === 'sub_property' && 
      instructionArgs.property !== 'verify_attribute' && 
      instructionArgs.property !== 'verify_css') {
    return false;
  }
  // Skip locator field if locator_type is 'ai'
  if (argKey === 'locator' && instructionArgs.locator_type === 'ai') {
    return false;
  }
  // Skip prompt field if locator_type is not 'ai'
  if (argKey === 'prompt' && instructionArgs.locator_type !== 'ai') {
    return false;
  }
  // Skip check and value fields if property is a "verify_if_*" option
  if ((argKey === 'value' || argKey === 'check') && 
      instructionArgs.property && 
      instructionArgs.property.startsWith('verify_if_')) {
    return false;
  }
  return true;
};

/**
 * Clears irrelevant fields when the target changes in verify actions
 * @param newArgs - The new arguments object
 * @param targetValue - The new target value ('page' or 'element')
 * @returns The updated arguments object
 */
export const clearVerifyFieldsOnTargetChange = (newArgs: any, targetValue: string | boolean): any => {
  if (targetValue === 'page') {
    // Clear element-specific fields when switching to page
    delete (newArgs as any).locator_type;
    delete (newArgs as any).prompt;
    delete (newArgs as any).locator;
    delete (newArgs as any).sub_property;
    delete (newArgs as any).value;
    // Clear property to force user to select page-specific property
    delete (newArgs as any).property;
  } else if (targetValue === 'element') {
    // Set default locator_type to 'ai' when target is 'element'
    (newArgs as any).locator_type = 'ai';
    // Clear property to force user to select element-specific property
    delete (newArgs as any).property;
  }
  return newArgs;
};

/**
 * Maps API property values to user-friendly display text
 * @param apiValue - The API property value
 * @returns The user-friendly display text
 */
export const getPropertyDisplayText = (apiValue: string): string => {
  const propertyMap: Record<string, string> = {
    'verify_url': 'Verify URL',
    'verify_title': 'Verify Title',
    'verify_text': 'Verify Text',
    'verify_class': 'Verify Class',
    'verify_count': 'Verify Count',
    'verify_value': 'Verify Value',
    'verify_css': 'Verify CSS',
    'verify_attribute': 'Verify Attribute',
    'verify_if_visible': 'Verify if Visible',
    'verify_if_checked': 'Verify if Checked',
    'verify_if_empty': 'Verify if Empty',
    'verify_if_in_viewport': 'Verify if in Viewport'
  };
  return propertyMap[apiValue] || apiValue;
};

/**
 * Maps target values to user-friendly display text
 * @param apiValue - The API target value
 * @returns The user-friendly display text
 */
export const getTargetDisplayText = (apiValue: string): string => {
  const targetMap: Record<string, string> = {
    'page': 'Page',
    'element': 'Element'
  };
  return targetMap[apiValue] || apiValue;
};

/**
 * Maps argument keys to user-friendly field names for error messages
 * @param key - The argument key
 * @returns The user-friendly field name
 */
export const getFieldDisplayName = (key: string): string => {
  const fieldMap: Record<string, string> = {
    'target': 'Target',
    'property': 'Property',
    'locator_type': 'Locator Type',
    'prompt': 'Locator Prompt',
    'locator': 'Locator',
    'check': 'Check',
    'value': 'Sub Property Value',
    'sub_property': 'Sub Property',
    'fail_test': 'Fail Test on Verification Failure',
    'expected_result': 'Expected result'
  };
  return fieldMap[key] || key;
};

/**
 * Transforms check values from UI format to backend format
 * @param checkValue - The check value from the UI
 * @returns The transformed check value for the backend
 */
export const transformCheckValueForBackend = (checkValue: string): string => {
  const checkMap: Record<string, string> = {
    'is': 'is',
    'contains': 'contains',
    'is greater than': 'greater_than',
    'is lesser than': 'less_than',
    'is greater than or equal to': 'greater_than_or_equal',
    'is lesser than or equal to': 'less_than_or_equal'
  };
  return checkMap[checkValue] || checkValue;
};

/**
 * Validates verify action arguments based on the specific property type
 * @param instructionArgs - The instruction arguments to validate
 * @returns Object with validation errors
 */
export const validateVerifyArguments = (instructionArgs: any, elementType?: string): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Always mandatory fields
  if (!instructionArgs.target) {
    errors.target = 'Target cannot be empty';
  }
  if (!instructionArgs.property) {
    errors.property = 'Property cannot be empty';
  }
  // Skip check field validation for verify_if_* properties (boolean checks)
  if (!instructionArgs.check && instructionArgs.property && !instructionArgs.property.startsWith('verify_if_')) {
    errors.check = 'Check cannot be empty';
  }
  if (!instructionArgs.fail_test) {
    errors.fail_test = 'Fail test cannot be empty';
  }
  if (!instructionArgs.expected_result) {
    errors.expected_result = 'Expected result cannot be empty';
  }
  
  // Target-specific validation
  if (instructionArgs.target === 'element') {
    if (!instructionArgs.locator_type) {
      errors.locator_type = 'Locator type cannot be empty';
    }
    
    if (instructionArgs.locator_type === 'ai') {
      // Check if this is an existing element (has element_id) or new element (needs prompt)
      if (instructionArgs.element_id) {
        // For existing elements, element_id is required instead of prompt
        if (!instructionArgs.element_id) {
          errors.element_id = 'Please select an element';
        }
      } else {
        // For new elements, prompt is required
        if (elementType === 'new' && !instructionArgs.prompt) {
          errors.prompt = 'Prompt cannot be empty';
        }
        if (elementType === 'existing' && !instructionArgs.element_id) {
          errors.element_id = 'Please select an element';
        }
      }
    } else if (instructionArgs.locator_type === 'manual') {
      if (!instructionArgs.locator) {
        errors.locator = 'Locator cannot be empty';
      }
    }
  }
  
  // Property-specific validation
  if (instructionArgs.property === 'verify_attribute') {
    if (!instructionArgs.sub_property) {
      errors.sub_property = 'Sub property cannot be empty';
    }
    // value is optional for verify_attribute
  } else if (instructionArgs.property === 'verify_css') {
    if (!instructionArgs.sub_property) {
      errors.sub_property = 'Sub property cannot be empty';
    }
    if (!instructionArgs.value) {
      errors.value = 'Sub property value cannot be empty';
    }
  } else if (instructionArgs.property === 'verify_count') {
    if (!instructionArgs.value) {
      errors.value = 'Value cannot be empty';
    }
  } else if (instructionArgs.property && !instructionArgs.property.startsWith('verify_if_')) {
    // For other properties that need a value (not verify_if_* properties)
    if (!instructionArgs.value) {
      errors.value = 'Value cannot be empty';
    }
  }
  
  return errors;
};
