export interface IError {
  code: string;
  message: string;
}

export const errorCodes: {[key: string]: IError} = {
  INTERNAL_SERVER_ERROR: {
    code: "ERR.SER0101",
    message: "Internal server error!",
  },

  PAGE_NOT_FOUND: {
    code: "ERR.SER0102",
    message: "Page was not found!",
  },
  ERROR_TRIEVING_KEYS: {
    code: "ERR.SER0103",
    message: "Error retrieving key!",
  },
  FORBIDDEN_ERROR: {
    code: "ERR.AUTH0101",
    message: "Access Denied You don’t have permission to access!",
  },
  UNAUTHORIZED: {
    code: "ERR.AUTH0102",
    message: "You do not have permission to access this page!",
  },
  FORBIDDEN_COMPANY_LOGIN: {
    code: "ERR.AUTH0201",
    message:
      "You have registered a company account, you only log in at the recruitment service!",
  },
  FORBIDDEN_LEASE_LOGIN: {
    code: "ERR.AUTH0202",
    message:
      "You have registered a lessor account, you only log in at the real estate service!",
  },
  FORBIDDEN_TRANSLATOR_LOGIN: {
    code: "ERR.AUTH0203",
    message:
      "You have registered a supporter account, you only log in to recruitment, real estate, and visa services!",
  },
  UNAUTHORIZED_LOGIN_FACEBOOK_REQUIRE_EMAIL: {
    code: "ERR.AUTH0204",
    message:
      "Please update the email address for your Facebook account and try again.",
  },

  // User errors
  USER_NOT_FOUND: {
    code: "ERR.USE0101",
    message: "User was not found!",
  },
  REGISTER_FAILED: {
    code: "ERR.USE0102",
    message: "Register failed!",
  },
  CHANGE_PASSWORD_FAILED: {
    code: "ERR.USE0103",
    message: "Change password failed!",
  },
  CHANGE_PROPERTY_ID_FAILED: {
    code: "ERR.USE0104",
    message: "Change property id failed!",
  },
  RESET_PASSWORD_FAILED: {
    code: "ERR.USE0105",
    message: "Reset password failed!",
  },
  INCORRECT_EMAIL_OR_PASSWORD: {
    code: "ERR.USE0106",
    message: "Incorrect email or password!",
  },
  LOGIN_OAUTH2_FAIL: {
    code: "ERR.USE0107",
    message: "Incorrect email or password!",
  },
  CHANGE_CREDENTIAL_NOT_CORRECT: {
    code: "ERR.USE0108",
    message: "Old password is not correct!",
  },
  EMAIL_DOES_NOT_EXIST: {
    code: "ERR.USE0109",
    message: "Email does not exist!",
  },
  RESET_PASSWORD_INCORRECT_CODE: {
    code: "ERR.USE0110",
    message: "Incorrect code reset password!",
  },
  EMAIL_ALREADY_IN_USE: {
    code: "ERR.USE0111",
    message: "Email already in use!",
  },
  PASSWORD_FIELDS_MUST_MATCH: {
    code: "ERR.USE0112",
    message: "The password fields must match!",
  },
  USER_IS_ENABLED: {
    code: "ERR.USE0114",
    message: "User is enabled!",
  },
  INCORRECT_CONFIRMATION_CODE: {
    code: "ERR.USE0115",
    message: "Incorrect confirmation code!",
  },
  NEW_PASSWORD_NOT_SAME_OLD_PASSWORD: {
    code: "ERR.USE0116",
    message: "The new password must not be the same as the old password!",
  },
  ACCOUNT_NOT_EXISTS: {
    code: "ERR.USE0117",
    message: "Account not exists!",
  },
  ACCOUNT_BLOCKED: {
    code: "ERR.USE0118",
    message: "Your account has been locked, please contact admin!",
  },
  ACCOUNT_NOT_ACTIVATED: {
    code: "ERR.USE0119",
    message: "Your account has not been activated, please confirm your email!",
  },
  TOKEN_REMOVE_ACCOUNT_EXPIRED: {
    code: "ERR.USE0201",
    message: "Verification code has expired!",
  },
  TOKEN_REMOVE_ACCOUNT_NOT_CORRECT: {
    code: "ERR.USE0202",
    message: "Verification code is not correct!",
  },

  // Authentication errors
  INVALID_TOKEN: {
    code: "ERR.TOK0101",
    message: "Invalid token!",
  },
  EXPIRED_TOKEN: {
    code: "ERR.TOK0102",
    message: "Expired token!",
  },
  REVOKED_TOKEN: {
    code: "ERR.TOK0103",
    message: "Revoked token!",
  },
  INVALID_REFRESH_TOKEN: {
    code: "ERR.TOK0201",
    message: "Invalid refresh token!",
  },
  EXPIRED_REFRESH_TOKEN: {
    code: "ERR.TOK0202",
    message: "Expired refresh token!",
  },
  REVOKED_REFRESH_TOKEN: {
    code: "ERR.TOK0203",
    message: "Revoked refresh token!",
  },

  // Folder errors
  FOLDER_NOT_FOUND: {
    code: "ERR.FOL0101",
    message: "Folder was not found!",
  },

  // Password errors
  PASSWORD_NOT_FOUND: {
    code: "ERR.PAS0101",
    message: "Password was not found!",
  },

  // Address errors
  ADDRESS_NOT_FOUND: {
    code: "ERR.ADD0101",
    message: "Address was not found!",
  },
  CONTACT_NOT_FOUND: {
    code: "ERR.CON0101",
    message: "Contact was not found!",
  },
  COUNTRY_NOT_FOUND: {
    code: "ERR.COU0101",
    message: "Country was not found!",
  },
  PAYMENT_NOT_FOUND: {
    code: "ERR.PAY0101",
    message: "Payment was not found!",
  },
  WRONG_MASTER_PASSWORD: {
    code: "ERR.MAS0101",
    message: "Master password was wrong!",
  },

  // MasterPassword errors
  MASTER_PASSWORD_INCORRECT: {
    code: "ERR.MAS0101",
    message: "Master password is incorrect!",
  },
  MASTER_PASSWORD_REQUIRED: {
    code: "ERR.MAS0102",
    message: "Master password is required!",
  },

  // PasswordGenerator errors
  PASSWORD_GENERATOR_NOT_FOUND: {
    code: "ERR.GEN0101",
    message: "Password generator was not found!",
  },

  // Language errors
  LANGUAGE_NOT_FOUND: {
    code: "ERR.LAN0101",
    message: "Language was not found!",
  },

  // Pin code errors
  PIN_CODE_NOT_MATCHED: {
    code: "ERR.PIN0101",
    message: "Pin code was not matched!",
  },
  PIN_CODE_WAS_ALREADY_DISABLED: {
    code: "ERR.PIN0201",
    message: "Pin code was already disabled!",
  },
  PIN_CODE_INCORRECT: {
    code: "ERR.PIN0301",
    message: "Pin code incorrect!",
  },

  // Item errors
  ITEM_NOT_FOUND: {
    code: "ERR.ITE0101",
    message: "Item not found!",
  },

  // UserPermission errors
  USER_PERMISSION_NOT_FOUND: {
    code: "ERR.UPM0101",
    message: "User permission was not found!",
  },
  YOU_CAN_NOT_ADD_YOURSELF: {
    code: "ERR.UPM0102",
    message: "You can not add yourself!",
  },
  INVITATION_ALREADY_ACCEPTED: {
    code: "ERR.UPM0103",
    message: "Invitation already accepted!",
  },
  PASSCODE_INCORRECT: {
    code: "ERR.PAC0103",
    message: "Passcode incorrect!",
  },
  INVALID_DATA: {
    code: "ERR.DAT0101",
    message: "Invalid data, please check the file you want to import again!",
  },
  DUPLICATE_ITEM: {
    code: "ERR.DAT0102",
    message: "Duplicate item, please check the file you want to import again!",
  },
  BACKUP_CREDENTIALS_FAILED: {
    code: "ERR.BAC0101",
    message: "Backup credential failed!",
  },
  BACKUP_KEY_NOT_FOUND: {
    code: "ERR.BAC0102",
    message: "Backup key not found!",
  },
};
