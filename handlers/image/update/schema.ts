export const updateImageSchema = {
  type: 'object',
  required: ['filename'],
  properties: {
    filename: {
      type: 'string',
    },
    description: {
      type: 'string'
    }
  }
} as const;
