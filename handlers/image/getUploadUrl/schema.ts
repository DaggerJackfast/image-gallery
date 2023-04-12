export const uploadSchema = {
  type: 'object',
  required: ['filename', 'contentType'],
  properties: {
    filename: {
      type: 'string'
    },
    contentType: {
      type: 'string'
    }
  }
} as const;
