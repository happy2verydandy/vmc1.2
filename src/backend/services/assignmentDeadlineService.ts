import { createClient } from '@supabase/supabase-js';
import { AssignmentError, AssignmentErrorCode } from '@/features/assignment/backend/error';

/**
 * Assignment 마감일 자동 처리 서비스
 * - 마감일이 지난 과제를 자동으로 closed 상태로 변경
 * - 주기적으로 실행되어야 하는 백엔드 서비스
 */
export class AssignmentDeadlineService {
  private static instance: AssignmentDeadlineService;
  
  public static getInstance(): AssignmentDeadlineService {
    if (!AssignmentDeadlineService.instance) {
      AssignmentDeadlineService.instance = new AssignmentDeadlineService();
    }
    return AssignmentDeadlineService.instance;
  }

  /**
   * 마감일이 지난 Assignment를 closed 상태로 자동 변경
   * 일반적으로 주기적으로 실행되어야 함 (Cron job or scheduled task)
   */
  async processExpiredAssignments(supabase: any) {
    try {
      const now = new Date().toISOString();
      
      // 마감일이 지난 published 상태의 과제들을 찾기
      const { data: assignments, error } = await supabase
        .from('assignments')
        .select(`
          id,
          course_id,
          title,
          due_date,
          status,
          courses(instructor_id)
        `)
        .eq('status', 'published')
        .lt('due_date', now); // 마감일이 현재 시간보다 이전인 과제

      if (error) {
        throw new AssignmentError(
          AssignmentErrorCode.ASSIGNMENT_NOT_FOUND,
          'Failed to fetch assignments with expired due dates: ' + error.message,
          500
        );
      }

      if (!assignments || assignments.length === 0) {
        console.log('No assignments with expired due dates found');
        return { updatedCount: 0, assignments: [] };
      }

      // 마감일이 지난 과제들을 closed 상태로 변경
      const updatedAssignments = [];
      for (const assignment of assignments) {
        try {
          const { data: updatedAssignment, error: updateError } = await supabase
            .from('assignments')
            .update({ 
              status: 'closed',
              updated_at: now 
            })
            .eq('id', assignment.id)
            .select()
            .single();

          if (updateError) {
            console.error(`Failed to update assignment ${assignment.id}:`, updateError);
            continue;
          }

          updatedAssignments.push(updatedAssignment);
          console.log(`Assignment ${assignment.id} (${assignment.title}) has been automatically closed due to deadline expiration`);
        } catch (updateError) {
          console.error(`Error updating assignment ${assignment.id}:`, updateError);
          continue;
        }
      }

      console.log(`Successfully updated ${updatedAssignments.length} assignments to closed status`);

      return {
        updatedCount: updatedAssignments.length,
        assignments: updatedAssignments
      };
    } catch (error) {
      console.error('Error in processExpiredAssignments:', error);
      throw error;
    }
  }

  /**
   * 주기적으로 실행할 수 있는 헬퍼 함수
   * 실제 실행 환경에 따라 호출 방식은 달라질 수 있음
   */
  async scheduleDeadlineProcessing(supabase: any, intervalMs: number = 60 * 60 * 1000) { // 기본 1시간마다
    console.log(`Scheduling assignment deadline processing every ${intervalMs}ms`);
    
    // 첫 실행
    await this.processExpiredAssignments(supabase);
    
    // 주기적 실행
    const interval = setInterval(async () => {
      try {
        await this.processExpiredAssignments(supabase);
      } catch (error) {
        console.error('Error in scheduled deadline processing:', error);
      }
    }, intervalMs);
    
    return interval;
  }
}

// 싱글턴 인스턴스 가져오기
export const assignmentDeadlineService = AssignmentDeadlineService.getInstance();