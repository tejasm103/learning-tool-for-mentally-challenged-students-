/**
 * MINDVERSE — INCLUSIVE LEARNING LAB
 * Centralized API & Data Client
 */

const MindVerseAPI = (function() {
  // Determine API Base URL
  // Can be configured via window.__ENV__?.API_BASE_URL or localStorage 'mv_api_base'
  let apiBase = window.__ENV__?.API_BASE_URL || localStorage.getItem('mv_api_base') || '';

  if (!apiBase) {
    if (window.location.protocol === 'file:') {
      apiBase = 'http://127.0.0.1:5000';
    } else if (window.location.port !== '5000' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      // If client is served from another local dev server (e.g. port 8000/5500), point to Flask on port 5000
      apiBase = `${window.location.protocol}//${window.location.hostname}:5000`;
    }
  }

  // Active user cache
  let currentUser = null;

  async function request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${apiBase}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    options.headers = { ...defaultHeaders, ...options.headers };
    options.credentials = 'include'; // Send session cookies

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`[MindVerse API] Fetch failed for ${endpoint}:`, err.message);
      
      // Resilient local fallback for curriculum & video endpoints if backend is offline
      if (endpoint.startsWith('/api/curriculum/')) {
        const subject = endpoint.replace('/api/curriculum/', '').split('?')[0].split('/')[0];
        const localFile = `data/${subject}.json`;
        try {
          const fallbackRes = await fetch(localFile);
          if (fallbackRes.ok) {
            console.info(`[MindVerse API] Using local fallback: ${localFile}`);
            return await fallbackRes.json();
          }
        } catch (e) {
          // pass
        }
      } else if (endpoint.startsWith('/api/videos')) {
        const localFile = `data/videos.json`;
        try {
          const fallbackRes = await fetch(localFile);
          if (fallbackRes.ok) {
            const list = await fallbackRes.json();
            return { count: list.length, videos: list };
          }
        } catch (e) {
          // pass
        }
      }
      throw err;
    }
  }

  return {
    getBaseUrl: () => apiBase,
    setBaseUrl: (newUrl) => {
      apiBase = newUrl;
      localStorage.setItem('mv_api_base', newUrl);
    },

    // Auth methods
    async getCurrentUser() {
      try {
        const data = await request('/api/auth/me');
        currentUser = data.user;
        return data;
      } catch (err) {
        return { user: null, logged_in: false };
      }
    },

    async login(username, password) {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      currentUser = res.user;
      return res;
    },

    async demoLogin(role = 'student') {
      const res = await request('/api/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role })
      });
      currentUser = res.user;
      return res;
    },

    async register(userData) {
      const res = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      currentUser = res.user;
      return res;
    },

    async logout() {
      await request('/api/auth/logout', { method: 'POST' });
      currentUser = null;
      window.location.href = 'login.html';
    },

    async savePreferences(prefs) {
      return await request('/api/auth/preferences', {
        method: 'POST',
        body: JSON.stringify(prefs)
      });
    },

    // Curriculum methods
    async getLessons(subject = '') {
      return await request(`/api/lessons${subject ? '?subject=' + subject : ''}`);
    },

    async getEnglishAlphabet(letter = '') {
      return await request(`/api/curriculum/english${letter ? '?letter=' + letter : ''}`);
    },

    async getKannada() {
      return await request('/api/curriculum/kannada');
    },

    async getHindi() {
      return await request('/api/curriculum/hindi');
    },

    async getMathematics() {
      return await request('/api/curriculum/math');
    },

    async getMultiplicationTable(number) {
      return await request(`/api/curriculum/multiplication/${number}`);
    },

    async getTrafficRules() {
      return await request('/api/curriculum/traffic');
    },

    async getEmotions() {
      return await request('/api/curriculum/emotions');
    },

    async getBodyParts() {
      return await request('/api/curriculum/body-parts');
    },

    async getWorkplaces() {
      return await request('/api/curriculum/workplaces');
    },

    async getStories(id = '') {
      return await request(`/api/curriculum/stories${id ? '?id=' + id : ''}`);
    },

    async getQuizzes(subject = '') {
      return await request(`/api/curriculum/quizzes${subject ? '?subject=' + subject : ''}`);
    },

    // Progress methods
    async getProgressSummary(studentId = null) {
      return await request(`/api/progress/summary${studentId ? '?student_id=' + studentId : ''}`);
    },

    async completeLesson(slug, score = 100, timeSpent = 60) {
      return await request('/api/progress/lesson/complete', {
        method: 'POST',
        body: JSON.stringify({ slug, score, time_spent_seconds: timeSpent })
      });
    },

    async submitQuiz(subject, quizName, totalQ, correctQ, answers = []) {
      return await request('/api/progress/quiz/submit', {
        method: 'POST',
        body: JSON.stringify({
          subject,
          quiz_name: quizName,
          total_questions: totalQ,
          correct_count: correctQ,
          answers
        })
      });
    },

    async getReportCard(studentId = null) {
      return await request(`/api/progress/report-card${studentId ? '?student_id=' + studentId : ''}`);
    },

    async getRecommendations() {
      return await request('/api/progress/recommendations');
    },

    // Video Library methods (Part 16)
    async getVideos(filters = {}) {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.review_status) params.append('review_status', filters.review_status);
      if (filters.state) params.append('state', filters.state);
      if (filters.search) params.append('search', filters.search);
      if (filters.language) params.append('language', filters.language);
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      return await request(`/api/videos${queryStr}`);
    },

    async getVideoDetail(videoId) {
      return await request(`/api/videos/${videoId}`);
    },

    async reviewVideo(videoId, updateData) {
      return await request(`/api/videos/${videoId}/review`, {
        method: 'POST',
        body: JSON.stringify(updateData)
      });
    },

    async submitVideoActivity(videoId, answers = [], reflection = '', timeSpent = 120) {
      return await request(`/api/videos/${videoId}/submit-activity`, {
        method: 'POST',
        body: JSON.stringify({
          answers,
          reflection,
          time_spent_seconds: timeSpent
        })
      });
    },

    // Student Activity Workflow methods (Part 17)
    async getActivities(studentId = null, status = null, type = null) {
      const params = new URLSearchParams();
      if (studentId) params.append('student_id', studentId);
      if (status) params.append('status', status);
      if (type) params.append('type', type);
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      return await request(`/api/activities${queryStr}`);
    },

    async getActivityDetail(activityId) {
      return await request(`/api/activities/${activityId}`);
    },

    async startActivity(activityId) {
      return await request(`/api/activities/${activityId}/start`, { method: 'POST' });
    },

    async submitActivity(activityId, answers = [], reflection = '', timeSpent = 120, score = null) {
      return await request(`/api/activities/${activityId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          answers,
          reflection,
          time_spent_seconds: timeSpent,
          score
        })
      });
    },

    async assignActivity(studentId, activityType, referenceId, instructions, title = '', subject = 'general') {
      return await request('/api/activities/assign', {
        method: 'POST',
        body: JSON.stringify({
          student_id: studentId,
          activity_type: activityType,
          reference_id: referenceId,
          instructions,
          title,
          subject
        })
      });
    },

    async submitStudentActivity(activityId, data = {}) {
      if (activityId) {
        return await this.submitActivity(
          activityId,
          data.answers || [],
          data.reflection || data.notes || '',
          data.time_spent_seconds || 120,
          data.score
        );
      } else {
        return await request('/api/activities/submit-direct', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
    },

    async getWorkplacesData() {
      const res = await fetch('data/workplaces.json');
      return await res.json();
    },

    // Teacher & Caregiver Verification Methods (Part 17 & 18)
    async getTeacherStats() {
      return await request('/api/teacher/stats');
    },

    async getTeacherStudents() {
      return await request('/api/teacher/students');
    },

    async getStudentDetail(studentId) {
      return await request(`/api/teacher/students/${studentId}`);
    },

    async getReviewQueue(filters = {}) {
      const params = new URLSearchParams();
      if (filters.student_id) params.append('student_id', filters.student_id);
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.needs_practice) params.append('needs_practice', 'true');
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      return await request(`/api/teacher/review-queue${queryStr}`);
    },

    async handleSubmissionAction(submissionId, action, feedback = '', badge = '') {
      return await request(`/api/teacher/submissions/${submissionId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, feedback, badge })
      });
    },

    async getStudentReport(studentId) {
      return await request(`/api/teacher/students/${studentId}/report`);
    },

    async assignLesson(studentId, lessonId, instructions) {
      return await request('/api/teacher/assignments', {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId, lesson_id: lessonId, instructions })
      });
    },

    async sendFeedback(studentId, feedbackText, badge) {
      return await request('/api/teacher/feedback', {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId, feedback_text: feedbackText, badge })
      });
    },

    async getCaregiverOverview() {
      return await request('/api/caregiver/overview');
    },

    // Games methods
    async getGames() {
      return await request('/api/games');
    },

    async saveGameResult(gameId, score, stars, timeSpent, difficulty = 'easy') {
      return await request(`/api/games/${gameId}/result`, {
        method: 'POST',
        body: JSON.stringify({ score, stars, time_spent_seconds: timeSpent, difficulty })
      });
    },

    // MindBot Chat
    async chatWithMindBot(message) {
      return await request('/api/mindbot/chat', {
        method: 'POST',
        body: JSON.stringify({ message })
      });
    },

    // User & Community Feedback System
    async getFeedbackCategories() {
      return await request('/api/feedback/categories');
    },

    async getFeedback(filters = {}) {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.role) params.append('role', filters.role);
      const qs = params.toString() ? `?${params.toString()}` : '';
      return await request(`/api/feedback${qs}`);
    },

    async submitFeedback(data) {
      return await request('/api/feedback', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async updateFeedbackStatus(feedbackId, status) {
      return await request(`/api/feedback/${feedbackId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
    },

    async getSystemDatabaseStatus() {
      return await request('/api/feedback/system/status');
    }
  };
})();
