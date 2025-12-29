/**
 * NLP-Based Extraction Engine
 * 
 * Phase 2: Enhanced interpretation with:
 * - Advanced clause classification
 * - Actor extraction
 * - Time binding
 * - Dependency detection
 * - Ambiguity detection
 */

export interface ExtractedActor {
  actor: string;
  role?: string;
  action: string;
  confidence: number;
}

export interface ExtractedDeadline {
  text: string;
  action: string;
  deadline: Date | null;
  relative: string | null; // e.g., "30 days from X"
  confidence: number;
}

export interface ExtractedDependency {
  clause_text: string;
  depends_on: string; // Reference to another clause/section
  condition: string;
  confidence: number;
}

export interface AmbiguityFlag {
  text: string;
  vague_terms: string[];
  recommendation: string;
  confidence: number;
}

export class NLPExtractor {
  /**
   * Enhanced clause classification with NLP patterns
   */
  classifyClause(text: string): {
    type: 'obligation' | 'prohibition' | 'penalty' | 'condition' | 'right' | 'definition' | 'other';
    confidence: number;
    indicators: string[];
  } {
    const lowerText = text.toLowerCase();
    const indicators: string[] = [];
    let confidence = 0.5;
    let type: 'obligation' | 'prohibition' | 'penalty' | 'condition' | 'right' | 'definition' | 'other' = 'other';

    // Obligation patterns (strong)
    const obligationPatterns = [
      /\b(shall|must|required|mandatory|obligated|obliged|duty|responsible for)\b/i,
      /\b(shall ensure|must provide|required to|mandated to)\b/i,
      /\b(contractor shall|party must|entity is required)\b/i,
    ];

    // Prohibition patterns (strong)
    const prohibitionPatterns = [
      /\b(shall not|must not|prohibited|forbidden|not allowed|not permitted)\b/i,
      /\b(no.*shall|cannot|may not|shall never)\b/i,
      /\b(restricted from|barred from|precluded from)\b/i,
    ];

    // Penalty patterns
    const penaltyPatterns = [
      /\b(penalty|fine|sanction|breach|violation|non-compliance)\b/i,
      /\b(shall pay|liable for|subject to fine|penalty of)\b/i,
      /\b(\$[\d,]+|USD [\d,]+|penalty amount)\b/i,
    ];

    // Condition patterns
    const conditionPatterns = [
      /\b(if|when|provided that|subject to|conditional upon)\b/i,
      /\b(unless|except|in the event that)\b/i,
      /\b(only if|as long as|so long as)\b/i,
    ];

    // Right patterns
    const rightPatterns = [
      /\b(may|entitled to|right to|permitted to|allowed to)\b/i,
      /\b(has the right|shall have the right|may elect)\b/i,
    ];

    // Definition patterns
    const definitionPatterns = [
      /\b(means|refers to|defined as|shall mean|for the purposes of)\b/i,
      /\b(hereinafter|herein|hereafter referred to)\b/i,
    ];

    // Check patterns in order of specificity
    if (prohibitionPatterns.some(p => p.test(text))) {
      type = 'prohibition';
      confidence = 0.85;
      indicators.push('prohibition');
    } else if (obligationPatterns.some(p => p.test(text))) {
      type = 'obligation';
      confidence = 0.8;
      indicators.push('obligation');
    } else if (penaltyPatterns.some(p => p.test(text))) {
      type = 'penalty';
      confidence = 0.75;
      indicators.push('penalty');
    } else if (conditionPatterns.some(p => p.test(text))) {
      type = 'condition';
      confidence = 0.7;
      indicators.push('condition');
    } else if (rightPatterns.some(p => p.test(text))) {
      type = 'right';
      confidence = 0.7;
      indicators.push('right');
    } else if (definitionPatterns.some(p => p.test(text))) {
      type = 'definition';
      confidence = 0.65;
      indicators.push('definition');
    }

    return { type, confidence, indicators };
  }

  /**
   * Extract actors (who must do what)
   */
  extractActors(text: string): ExtractedActor[] {
    const actors: ExtractedActor[] = [];
    const lowerText = text.toLowerCase();

    // Common actor patterns
    const actorPatterns = [
      {
        pattern: /\b(contractor|vendor|supplier|service provider)\b/i,
        role: 'Contractor',
        confidence: 0.8,
      },
      {
        pattern: /\b(client|customer|buyer|purchaser)\b/i,
        role: 'Client',
        confidence: 0.8,
      },
      {
        pattern: /\b(regulator|regulatory|authority|agency)\b/i,
        role: 'Regulator',
        confidence: 0.75,
      },
      {
        pattern: /\b(party|parties|entity|entities)\b/i,
        role: 'Party',
        confidence: 0.6,
      },
    ];

    // Action patterns
    const actionPatterns = [
      /\b(shall|must|required to|obligated to)\s+([^.]{5,50}?)(?:\.|$)/gi,
      /\b(shall ensure|must provide|must maintain|must implement)\s+([^.]{5,50}?)(?:\.|$)/gi,
    ];

    for (const actorPattern of actorPatterns) {
      const actorMatch = text.match(actorPattern.pattern);
      if (actorMatch) {
        const actorText = actorMatch[0];
        
        // Extract action
        for (const actionPattern of actionPatterns) {
          const actionMatch = text.match(actionPattern);
          if (actionMatch && actionMatch[2]) {
            actors.push({
              actor: actorText,
              role: actorPattern.role,
              action: actionMatch[2].trim(),
              confidence: actorPattern.confidence * 0.8, // Reduce confidence for combined extraction
            });
          }
        }

        // If no action found, still record the actor
        if (actors.length === 0 || !actors.some(a => a.actor === actorText)) {
          actors.push({
            actor: actorText,
            role: actorPattern.role,
            action: 'Action to be determined',
            confidence: actorPattern.confidence * 0.6,
          });
        }
      }
    }

    return actors;
  }

  /**
   * Extract deadlines and time bindings
   */
  extractDeadlines(text: string, baseDate: Date = new Date()): ExtractedDeadline[] {
    const deadlines: ExtractedDeadline[] = [];
    
    // Relative time patterns
    const relativePatterns = [
      {
        pattern: /\b(within|no later than|by)\s+(\d+)\s+(day|days|week|weeks|month|months|year|years)\s+(?:of|from|after)\s+([^.]{5,30}?)(?:\.|$)/gi,
        extractor: (match: RegExpMatchArray) => {
          const amount = parseInt(match[2]);
          const unit = match[3].toLowerCase();
          const reference = match[4]?.trim();
          
          let days = 0;
          if (unit.includes('day')) days = amount;
          else if (unit.includes('week')) days = amount * 7;
          else if (unit.includes('month')) days = amount * 30;
          else if (unit.includes('year')) days = amount * 365;

          const deadline = new Date(baseDate);
          deadline.setDate(deadline.getDate() + days);

          return {
            text: match[0],
            action: reference || 'specified event',
            deadline,
            relative: `${amount} ${unit} from ${reference || 'now'}`,
            confidence: 0.8,
          };
        },
      },
      {
        pattern: /\b(within|no later than|by)\s+(\d+)\s+(day|days|week|weeks|month|months|year|years)(?:\.|$)/gi,
        extractor: (match: RegExpMatchArray) => {
          const amount = parseInt(match[2]);
          const unit = match[3].toLowerCase();
          
          let days = 0;
          if (unit.includes('day')) days = amount;
          else if (unit.includes('week')) days = amount * 7;
          else if (unit.includes('month')) days = amount * 30;
          else if (unit.includes('year')) days = amount * 365;

          const deadline = new Date(baseDate);
          deadline.setDate(deadline.getDate() + days);

          return {
            text: match[0],
            action: 'immediate',
            deadline,
            relative: `${amount} ${unit} from now`,
            confidence: 0.75,
          };
        },
      },
      {
        pattern: /\b(on or before|by|no later than)\s+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})(?:\.|$)/gi,
        extractor: (match: RegExpMatchArray) => {
          const dateStr = match[2];
          const deadline = new Date(dateStr);

          return {
            text: match[0],
            action: 'specified date',
            deadline: isNaN(deadline.getTime()) ? null : deadline,
            relative: dateStr,
            confidence: 0.9,
          };
        },
      },
    ];

    for (const pattern of relativePatterns) {
      const matches = Array.from(text.matchAll(pattern.pattern));
      for (const match of matches) {
        try {
          const deadline = pattern.extractor(match);
          deadlines.push(deadline);
        } catch (error) {
          // Skip invalid matches
        }
      }
    }

    return deadlines;
  }

  /**
   * Detect dependencies between clauses
   */
  extractDependencies(text: string): ExtractedDependency[] {
    const dependencies: ExtractedDependency[] = [];

    // Dependency patterns
    const dependencyPatterns = [
      {
        pattern: /\b(this|the foregoing|the above)\s+(?:applies|is subject to|is conditional upon)\s+(?:only if|if|provided that)\s+(?:section|clause|paragraph)\s+([\d.]+)/gi,
        extractor: (match: RegExpMatchArray) => ({
          clause_text: match[0],
          depends_on: match[1] || 'unknown',
          condition: 'conditional',
          confidence: 0.8,
        }),
      },
      {
        pattern: /\b(?:subject to|in accordance with|as per|pursuant to)\s+(?:section|clause|paragraph|article)\s+([\d.]+)/gi,
        extractor: (match: RegExpMatchArray) => ({
          clause_text: match[0],
          depends_on: match[1] || 'unknown',
          condition: 'reference',
          confidence: 0.75,
        }),
      },
      {
        pattern: /\b(?:unless|except)\s+(?:section|clause|paragraph)\s+([\d.]+)\s+(?:provides|states|specifies)/gi,
        extractor: (match: RegExpMatchArray) => ({
          clause_text: match[0],
          depends_on: match[1] || 'unknown',
          condition: 'exception',
          confidence: 0.7,
        }),
      },
    ];

    for (const pattern of dependencyPatterns) {
      const matches = Array.from(text.matchAll(pattern.pattern));
      for (const match of matches) {
        try {
          const dependency = pattern.extractor(match);
          dependencies.push(dependency);
        } catch (error) {
          // Skip invalid matches
        }
      }
    }

    return dependencies;
  }

  /**
   * Detect ambiguous/vague language
   */
  detectAmbiguity(text: string): AmbiguityFlag[] {
    const ambiguities: AmbiguityFlag[] = [];

    // Vague terms that need clarification
    const vagueTerms = [
      { term: 'adequate', recommendation: 'Specify measurable criteria for "adequate"' },
      { term: 'reasonable', recommendation: 'Define what constitutes "reasonable" in this context' },
      { term: 'sufficient', recommendation: 'Specify minimum requirements for "sufficient"' },
      { term: 'appropriate', recommendation: 'Clarify what is considered "appropriate"' },
      { term: 'timely', recommendation: 'Define specific timeframes for "timely"' },
      { term: 'best efforts', recommendation: 'Specify concrete actions required, not just "best efforts"' },
      { term: 'as needed', recommendation: 'Define criteria for when action is needed' },
      { term: 'when necessary', recommendation: 'Specify conditions that make action necessary' },
      { term: 'material', recommendation: 'Define what constitutes "material" impact or change' },
      { term: 'significant', recommendation: 'Specify thresholds for "significant" events' },
    ];

    const lowerText = text.toLowerCase();
    const foundTerms: string[] = [];

    for (const vagueTerm of vagueTerms) {
      const regex = new RegExp(`\\b${vagueTerm.term}\\b`, 'i');
      if (regex.test(text)) {
        foundTerms.push(vagueTerm.term);
        
        // Find context around the vague term
        const match = text.match(new RegExp(`.{0,50}\\b${vagueTerm.term}\\b.{0,50}`, 'i'));
        const context = match ? match[0] : text.substring(0, 100);

        ambiguities.push({
          text: context,
          vague_terms: [vagueTerm.term],
          recommendation: vagueTerm.recommendation,
          confidence: 0.9,
        });
      }
    }

    return ambiguities;
  }

  /**
   * Enhanced confidence scoring based on multiple factors
   */
  calculateConfidence(
    classification: { confidence: number },
    hasActor: boolean,
    hasDeadline: boolean,
    hasDependency: boolean,
    hasAmbiguity: boolean
  ): number {
    let confidence = classification.confidence;

    // Boost confidence if we extracted structured data
    if (hasActor) confidence += 0.1;
    if (hasDeadline) confidence += 0.1;
    if (hasDependency) confidence += 0.05;

    // Reduce confidence if ambiguous
    if (hasAmbiguity) confidence -= 0.2;

    // Clamp between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }
}

