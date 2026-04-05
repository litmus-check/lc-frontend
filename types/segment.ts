// Segment API Types
export interface TestSegment {
  segment_id: string;
  test_id: string;
  suite_id: string;
  segment_name: string;
  start_instruction_id: string;
  end_instruction_id: string;
  created_at: string;
  modified_at: string;
}

export interface CreateSegmentRequest {
  segment_name: string;
  test_id: string;
  start_instruction_id: string;
  end_instruction_id: string;
}

export interface UpdateSegmentRequest {
  segment_name: string;
  test_id: string;
  start_instruction_id: string;
  end_instruction_id: string;
}

export interface GetSegmentResponse {
  segment_id: string;
  test_id: string;
  suite_id: string;
  start_instruction_id: string;
  end_instruction_id: string;
  created_at: string;
  modified_at: string;
}

export interface CreateSegmentResponse {
  segment_id: string;
  test_id: string;
  suite_id: string;
  start_instruction_id: string;
  end_instruction_id: string;
  created_at: string;
  modified_at: string;
}

export interface GetSegmentsBySuiteResponse {
  test_segments: Array<{
    segment_id: string;
    test_id: string;
    start_instruction_id: string;
    end_instruction_id: string;
    created_at: string;
    modified_at: string;
  }>;
}

export interface UpdateSegmentResponse {
  segment_id: string;
  test_id: string;
  start_instruction_id: string;
  end_instruction_id: string;
  created_at: string;
  modified_at: string;
}

export interface DeleteSegmentResponse {
  message: string;
}
