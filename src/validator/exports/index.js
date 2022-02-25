const InvariantError = require('../../exceptions/InvariantError');
const ExportsNotesPayloadSchema = require('./schema');

const ExportsValidator = {
  validateExportsNotesPayload: (payload) => {
    const validationResult = ExportsNotesPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportsValidator;
