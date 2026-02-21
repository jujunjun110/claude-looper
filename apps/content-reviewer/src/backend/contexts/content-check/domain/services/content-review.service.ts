import type { CheckResult } from '@/backend/contexts/content-check/domain/models/check-result.model';

export class ContentReviewService {
	summarize(results: CheckResult[]): { error: number; warning: number; info: number } {
		let error = 0;
		let warning = 0;
		let info = 0;

		for (const result of results) {
			if (result.severity === 'error') {
				error++;
			} else if (result.severity === 'warning') {
				warning++;
			} else if (result.severity === 'info') {
				info++;
			}
		}

		return { error, warning, info };
	}
}
