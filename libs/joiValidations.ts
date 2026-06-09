import Joi from 'joi';

export const validatePatient = Joi.object({
    firstName: Joi.string().required().messages({ 'string.empty': 'Enter a valid first name for patient' }),
    lastName: Joi.string().required().messages({ 'string.empty': 'Enter a valid last name for patient' }),
    recordNumber: Joi.string().required().messages({ 'string.empty': 'Enter the right credential for patient record number!' }),
    dateOfBirth: Joi.date().allow(null).messages({ 'date.base': 'Enter a valid date of birth' }),
    gender: Joi.string().valid('Male', 'Female').required().messages({
        'any.only': 'Select a valid gender for patient',
        'string.empty': 'Gender is required'
    }),
    phone: Joi.string().required().messages({ 'string.empty': 'Enter a valid phone number for patient' }),

});

export const validatePatientPartner = Joi.object({
    partnerId: Joi.number(),
    firstName: Joi.string().required().messages({ 'string.empty': 'Enter a valid first name for partner' }),
    lastName: Joi.string().required().messages({ 'string.empty': 'Enter a valid last name for partner' }),
    dateOfBirth: Joi.date().allow(null).messages({ 'date.base': 'Enter a valid date of birth for partner' }),
    occupation: Joi.string().optional().allow(''),
    phone: Joi.string().required().messages({ 'string.empty': 'Enter a valid phone number for patient partner' }),
    email: Joi.string().email().required().messages({
        'string.empty': 'Enter a valid email for patient partner',
        'string.email': 'Enter a valid email format for partner'
    }),
    gender: Joi.string()
});

export const validateDoctor = Joi.object({
    userId: Joi.number().optional(),
    firstName: Joi.string().trim().min(2).max(100).required().messages({
        'string.empty': 'First name is required',
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 100 characters',
        'any.required': 'First name is required'
    }),

    lastName: Joi.string().trim().min(2).max(100).required().messages({
        'string.empty': 'Last name is required',
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 100 characters',
        'any.required': 'Last name is required'
    }),
    role: Joi.string().valid('doctor', 'nurse', 'admin', 'lab_tech').required().messages({
        'any.only': 'Role must be Nurse, Doctor, or Lab Technician',
        'string.empty': 'Role is required',
        'any.required': 'Role is required'
    }),
    gender: Joi.string().valid('male', 'female', 'other').required().messages({
        'any.only': 'Gender must be male, female, or other',
        'string.empty': 'Gender is required',
        'any.required': 'Gender is required'
    }),

    dateOfBirth: Joi.date().max('now').min('1940-01-01').optional().allow(null).messages({
        'date.max': 'Date of birth cannot be in the future',
        'date.min': 'Date of birth must be after 1940',
        'date.base': 'Please provide a valid date of birth'
    }),

    phoneNumber: Joi.string()
        .trim()
        .pattern(/^[\+]?[0-9\-\(\)\s]{10,20}$/)
        .required()
        .messages({
            'string.empty': 'Phone number is required',
            'string.pattern.base': 'Please provide a valid phone number (10-20 digits)',
            'any.required': 'Phone number is required'
        }),

    email: Joi.string()
        .trim()
        .email({ tlds: { allow: false } })
        .max(150)
        .required()
        .messages({
            'string.empty': 'Email address is required',
            'string.email': 'Please provide a valid email address',
            'string.max': 'Email address cannot exceed 150 characters',
            'any.required': 'Email address is required'
        }),

    specialization: Joi.string().trim().min(2).max(100).required().messages({
        'string.empty': 'Specialization is required',
        'string.min': 'Specialization must be at least 2 characters long',
        'string.max': 'Specialization cannot exceed 100 characters',
        'any.required': 'Specialization is required'
    }),

    hireDate: Joi.date().max('now').required().messages({
        'date.base': 'Please provide a valid hire date',
        'date.max': 'Hire date cannot be in the future',
        'any.required': 'Hire date is required'
    }),

    employmentStatus: Joi.string().valid('active', 'inactive', 'retired', 'on_leave').default('active').messages({
        'any.only': 'Employment status must be active, inactive, retired, or on_leave'
    }),

    username: Joi.string().trim().alphanum().min(3).max(50).required().messages({
        'string.empty': 'Username is required',
        'string.alphanum': 'Username must only contain letters and numbers',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 50 characters',
        'any.required': 'Username is required'
    }),

    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password cannot exceed 128 characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
            'any.required': 'Password is required'
        })
});

// Validation for doctor credentials
export const validateDoctorCredential = Joi.object({
    credentialId: Joi.number().optional(),
    doctorId: Joi.number().optional(),

    licenseNumber: Joi.string().trim().min(3).max(100).required().messages({
        'string.empty': 'License number is required',
        'string.min': 'License number must be at least 3 characters long',
        'string.max': 'License number cannot exceed 100 characters',
        'any.required': 'License number is required'
    }),

    licenseExpiry: Joi.date().min('now').optional().allow(null).messages({
        'date.min': 'License expiry date must be in the future',
        'date.base': 'Please provide a valid license expiry date'
    }),

    qualification: Joi.string().trim().min(2).max(200).required().messages({
        'string.empty': 'Qualification is required',
        'string.min': 'Qualification must be at least 2 characters long',
        'string.max': 'Qualification cannot exceed 200 characters',
        'any.required': 'Qualification is required'
    }),

    institution: Joi.string().trim().max(200).optional().allow('').messages({
        'string.max': 'Institution name cannot exceed 200 characters'
    }),

    certificationDate: Joi.date().max('now').optional().allow(null).messages({
        'date.max': 'Certification date cannot be in the future',
        'date.base': 'Please provide a valid certification date'
    })
});

// Validation for login (username and password only)
export const validateDoctorLogin = Joi.object({
    username: Joi.string().trim().required().messages({
        'string.empty': 'Username is required',
        'any.required': 'Username is required'
    }),

    password: Joi.string().required().messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required'
    })
});

// Reusable ISO date/time regex (MySQL compatible)
const mysqlDateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
const mysqlTimeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/; // HH:MM or HH:MM:SS

// Helper to validate JSON string or object and normalize to object
const jsonField = Joi.alternatives().try(
    Joi.object(), // already parsed object
    Joi.string().custom((value, helpers) => {
        try {
            const parsed = JSON.parse(value);
            if (parsed === null || typeof parsed !== 'object') {
                return helpers.error('any.invalid');
            }
            return parsed; // convert to object
        } catch {
            return helpers.error('any.invalid');
        }
    }, 'JSON parse')
);

export const validateAppointment = Joi.object({
    // DB-generated, typically not provided on create
    appointmentId: Joi.number(),

    patientId: Joi.number(),
    doctorId: Joi.number(),

    appointmentType: Joi.string().valid('Initial Consultation', 'Follow-up Visit','Procedure Consultation','Test Results Review','Post-procedure Check').required(),

    // MySQL double -> number; apply sane bounds if desired
    estimatedDuration: Joi.number().positive().precision(3).optional(),

    // Allow null like DB default; otherwise enforce MySQL date format
    appointmentDate: Joi.alternatives().try(Joi.string().pattern(mysqlDateRegex), Joi.date().iso(), Joi.valid(null)).optional(),

    appointmentTime: Joi.string().pattern(mysqlTimeRegex).required(),

    // JSON fields (longtext with CHECK json_valid)
    measurements: jsonField.allow(null).optional(),
    preVisitInfo: jsonField.allow(null).optional(),
    vitalSigns: jsonField.allow(null).optional(),

    notes: Joi.string().allow('', null).max(65535).optional(),

    // Note: column name is `priorty` in schema (likely a typo). Matching DB:
    priority: Joi.string().valid('Routine').required(),

    status: Joi.string().valid('Scheduled', 'Confirmed', 'InProgress', 'Completed', 'Cancelled', 'NoShow').required(),

    cancellationReason: Joi.when('status', {
        is: 'Cancelled',
        then: Joi.string().min(10).max(500).required(),
        otherwise: Joi.string().min(10).max(500).optional()
    })
})
    // Optional: strip unknown keys to match table columns
    .options({ stripUnknown: true });


export const validateExpenditure = Joi.object({
    expenditureId: Joi.number().integer().min(1), // Optional on insert (auto-incremented)

    expenseDate: Joi.date(),

    category: Joi.string().valid(
        'Medical Equipment',
        'Pharmaceuticals',
        'Medical Supplies',
        'Utilities',
        'Staff Salaries',
        'Building Maintenance',
        'Insurance',
        'Professional Service',
        'Technology',
        'Training Education',
        'Administrative',
        'Marketing',
        'Other'
    ).messages({'any.only':'Choose category from the list provided.'}),

    subCategory: Joi.string().valid(
        'Diagnostic Equipment',
        'Surgical Instruments',
        'Emergency Drugs',
        'General Medicine',
        'Office Supplies',
        'Cleaning Supplies',
        'Other'
    ).allow('',null).optional(),

    department: Joi.string().valid(
        'Surgery',
        'Radiology',
        'Laboratory',
        'Pharmacy',
        'Administration',
        'IT',
        'Maintenance'
    ).messages({'any.only':'Select department for expenditure'}),

    description: Joi.string().messages({'string.empty':'Enter a description for expenditure'}),

    vendor: Joi.object({
        vendor: Joi.string().messages({'string.empty':'Enter a vendor name'}),
        contactPerson: Joi.string().allow(''),
        contactPhone: Joi.string().allow(''),
        contactEmail: Joi.string().email().allow('')
    }),

    items: Joi.array().min(1).messages({'array.min':'Add at least one expense item.'}), // You can define a stricter schema if you know the structure

    taxAmount: Joi.number().precision(2).min(0).required().default(0.00),

    discountAmount: Joi.number().precision(2).min(0).required().default(0.00),

    totalAmount: Joi.number().precision(2).min(0).required().default(0.00),

    status: Joi.string().valid(
        'Pending',
        'Approved',
        'Paid',
        'Rejected',
        'Cancelled'
    ).messages({'any.only':'Select status for expenditure'}),

    priority: Joi.string().valid(
        'Low',
        'Medium',
        'High',
        'Critical'
    ).messages({'any.only':'Select priority level for you expenditure'}),

    paymentMethod: Joi.string().valid(
        'Cash',
        'Bank Transfer',
        'Credit Card',
        'Mobile Money',
        'Other'
    ).messages({'any.only':'Select payment method'}),

    paymentDate: Joi.date(),

    receiptNumber: Joi.string().optional().allow(''),

    invoiceNumber: Joi.string().optional().allow(''),

    userId: Joi.number().integer().required()
});

export const validateRefund = Joi.object({
    reason: Joi.string().trim().min(10).max(500).required().messages({
        'string.empty': 'Please provide a reason for the refund',
        'string.min': 'Refund reason must be at least 10 characters'
    })
});

export const validateForgotPassword = Joi.object({
    username: Joi.string().trim().required().messages({ 'string.empty': 'Enter your username to receive a reset link' })
});

export const validateResetPassword = Joi.object({
    token: Joi.string().required().messages({ 'string.empty': 'Reset token is missing or invalid' }),
    newPassword: Joi.string().min(8).required().messages({
        'string.empty': 'Enter a new password',
        'string.min': 'Password must be at least 8 characters'
    }),
    confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required().messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Confirm your new password'
    })
});

export const validateVoidBill = Joi.object({
    reason: Joi.string().trim().min(10).max(500).required().messages({
        'string.empty': 'Reason is required',
        'string.min': 'Reason must be at least 10 characters'
    })
});

export const validateInvestigationResult = Joi.object({
    investigationId: Joi.number().integer().positive().required(),
    resultValue: Joi.string().allow('', null).optional(),
    resultNumeric: Joi.number().allow(null).optional(),
    comments: Joi.string().allow('', null).max(2000).optional(),
    attachmentFileId: Joi.string().allow('', null).max(60).optional()
})
    .or('resultValue', 'resultNumeric')
    .messages({
        'object.missing': 'Provide either a result value or a numeric result'
    });

export const validateRejectResult = Joi.object({
    reason: Joi.string().trim().min(10).max(500).required().messages({
        'string.empty': 'A rejection reason is required',
        'string.min': 'Rejection reason must be at least 10 characters'
    })
});

export const validateArtCycleOutcome = Joi.object({
    outcome: Joi.string()
        .valid('Positive', 'Negative', 'Biochemical', 'Clinical Pregnancy', 'ClinicalPregnancy', 'Miscarriage', 'Live Birth', 'LiveBirth')
        .required()
        .messages({ 'any.required': 'Select an outcome', 'any.only': 'Select a valid outcome' }),
    notes: Joi.string().trim().allow('', null).max(2000).optional(),
    recordedDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .allow('', null)
        .optional()
        .messages({ 'string.pattern.base': 'Recorded date must be YYYY-MM-DD' })
});

export const validateTankAction = Joi.object({
    reason: Joi.string().trim().min(10).max(500).required().messages({
        'string.empty': 'A reason is required',
        'string.min': 'Reason must be at least 10 characters',
        'string.max': 'Reason must be at most 500 characters',
        'any.required': 'A reason is required'
    })
});

// ---------------------------------------------------------------------
// Module 11 — Procedure Consultation & Post-procedure Follow-up
// ---------------------------------------------------------------------
export const validateProcedureConsultation = Joi.object({
    patientId: Joi.number().integer().positive().required().messages({
        'any.required': 'A patient is required for the consultation',
        'number.base': 'A valid patient is required'
    }),
    visitId: Joi.number().integer().positive().allow(null).optional(),
    plannedProcedure: Joi.string().trim().min(1).max(255).required().messages({
        'string.empty': 'Planned procedure is required',
        'any.required': 'Planned procedure is required'
    }),
    procedureDetails: Joi.object().unknown(true).optional().allow(null),
    assessment: Joi.object().unknown(true).optional().allow(null),
    consent: Joi.object().unknown(true).optional().allow(null),
    instructions: Joi.object().unknown(true).optional().allow(null),
    consentSignatureFileId: Joi.string().trim().max(60).allow('', null).optional()
}).unknown(true);

export const validateProcedureFollowup = Joi.object({
    consultationId: Joi.number().integer().positive().required().messages({
        'any.required': 'A parent consultation is required',
        'number.base': 'A valid consultation is required'
    }),
    patientId: Joi.number().integer().positive().required().messages({
        'any.required': 'A patient is required',
        'number.base': 'A valid patient is required'
    }),
    symptoms: Joi.object().unknown(true).optional().allow(null),
    recovery: Joi.object().unknown(true).optional().allow(null),
    complications: Joi.object().unknown(true).optional().allow(null),
    outcome: Joi.string().trim().max(40).allow('', null).optional(),
    notes: Joi.string().trim().max(5000).allow('', null).optional()
}).unknown(true);
