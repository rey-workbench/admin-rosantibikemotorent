export interface AiKnowledge {
    id: string;
    category: string;
    question: string;
    answer: string;
    keywords: string[];
    priority: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AiKnowledgeDto {
    category: string;
    question: string;
    answer: string;
    keywords: string[];
    priority: number;
}

export interface AiTestRequest {
    message: string;
    isWNA?: boolean;
}

export interface AiTestResponse {
    message: string;
    response: string;
    debug?: {
        matches: any[];
    };
}
