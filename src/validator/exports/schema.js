const Joi = require('joi');

const ExportsNotesPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = ExportsNotesPayloadSchema;
