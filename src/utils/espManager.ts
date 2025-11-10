/**
 * ESP (Email Service Provider) Manager
 * Comprehensive system for managing integrations with various email service providers
 * Handles merge tags, API integrations, and personalized content delivery
 */

import { resolveTokens, validateTokens } from './tokenResolver';
import { PERSONALIZATION_TOKENS } from '../types/personalization';

// ESP Configuration Interface
export interface ESPConfig {
  name: string;
  displayName: string;
  category: 'marketing' | 'transactional' | 'crm';
  mergeTagFormat: string;
  imageTagFormat: string;
  supportedTokens: string[];
  apiEndpoints?: {
    sendEmail?: string;
    createContact?: string;
    updateContact?: string;
    getContacts?: string;
  };
  authentication?: {
    type: 'api_key' | 'oauth' | 'basic_auth';
    requiredFields: string[];
  };
  features: {
    mergeTags: boolean;
    dynamicContent: boolean;
    apiIntegration: boolean;
    webhooks: boolean;
    templates: boolean;
    segmentation: boolean;
  };
  limits?: {
    maxRecipients?: number;
    maxEmailsPerHour?: number;
    maxMergeTags?: number;
  };
}

// Comprehensive ESP Database
export const ESP_DATABASE: Record<string, ESPConfig> = {
  // Marketing Automation Platforms
  mailchimp: {
    name: 'mailchimp',
    displayName: 'Mailchimp',
    category: 'marketing',
    mergeTagFormat: '*|TOKEN|*',
    imageTagFormat: '<img src="*|IMAGE_URL|*" alt="*|ALT_TEXT|*" style="*|IMAGE_STYLE|*">',
    supportedTokens: ['FNAME', 'LNAME', 'EMAIL', 'COMPANY', 'MMERGE1', 'MMERGE2', 'MMERGE3', 'MMERGE4', 'MMERGE5'],
    apiEndpoints: {
      sendEmail: 'https://api.mailchimp.com/3.0/campaigns/{campaign_id}/actions/send',
      createContact: 'https://api.mailchimp.com/3.0/lists/{list_id}/members',
      updateContact: 'https://api.mailchimp.com/3.0/lists/{list_id}/members/{email_hash}',
      getContacts: 'https://api.mailchimp.com/3.0/lists/{list_id}/members'
    },
    authentication: {
      type: 'api_key',
      requiredFields: ['api_key', 'server_prefix']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 2000,
      maxEmailsPerHour: 10000,
      maxMergeTags: 30
    }
  },

  klaviyo: {
    name: 'klaviyo',
    displayName: 'Klaviyo',
    category: 'marketing',
    mergeTagFormat: '{{ person|lookup:"TOKEN" }}',
    imageTagFormat: '<img src="{{IMAGE_URL}}" alt="{{ALT_TEXT}}" style="{{IMAGE_STYLE}}">',
    supportedTokens: ['first_name', 'last_name', 'email', 'phone', 'city', 'state', 'country', 'custom_properties'],
    apiEndpoints: {
      sendEmail: 'https://a.klaviyo.com/api/v2/email/send',
      createContact: 'https://a.klaviyo.com/api/v2/people',
      updateContact: 'https://a.klaviyo.com/api/v2/people/{person_id}',
      getContacts: 'https://a.klaviyo.com/api/v2/people'
    },
    authentication: {
      type: 'api_key',
      requiredFields: ['private_api_key', 'public_api_key']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 1000,
      maxEmailsPerHour: 50000,
      maxMergeTags: 50
    }
  },

  sendgrid: {
    name: 'sendgrid',
    displayName: 'SendGrid',
    category: 'transactional',
    mergeTagFormat: '{{TOKEN}}',
    imageTagFormat: '<img src="{{IMAGE_URL}}" alt="{{ALT_TEXT}}" style="{{IMAGE_STYLE}}">',
    supportedTokens: ['first_name', 'last_name', 'email', 'company', 'custom_fields'],
    apiEndpoints: {
      sendEmail: 'https://api.sendgrid.com/v3/mail/send',
      createContact: 'https://api.sendgrid.com/v3/marketing/contacts',
      updateContact: 'https://api.sendgrid.com/v3/marketing/contacts',
      getContacts: 'https://api.sendgrid.com/v3/marketing/contacts'
    },
    authentication: {
      type: 'api_key',
      requiredFields: ['api_key']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 1000,
      maxEmailsPerHour: 100000,
      maxMergeTags: 100
    }
  },

  hubspot: {
    name: 'hubspot',
    displayName: 'HubSpot',
    category: 'crm',
    mergeTagFormat: '{{contact.TOKEN}}',
    imageTagFormat: '<img src="{{IMAGE_URL}}" alt="{{ALT_TEXT}}" style="{{IMAGE_STYLE}}">',
    supportedTokens: ['firstname', 'lastname', 'email', 'company', 'phone', 'city', 'state', 'country', 'jobtitle'],
    apiEndpoints: {
      sendEmail: 'https://api.hubapi.com/marketing/v3/marketing-emails/{email_id}/send',
      createContact: 'https://api.hubapi.com/crm/v3/objects/contacts',
      updateContact: 'https://api.hubapi.com/crm/v3/objects/contacts/{contact_id}',
      getContacts: 'https://api.hubapi.com/crm/v3/objects/contacts'
    },
    authentication: {
      type: 'api_key',
      requiredFields: ['hapikey']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 1000,
      maxEmailsPerHour: 10000,
      maxMergeTags: 50
    }
  },

  activecampaign: {
    name: 'activecampaign',
    displayName: 'ActiveCampaign',
    category: 'marketing',
    mergeTagFormat: '%TOKEN%',
    imageTagFormat: '<img src="%IMAGE_URL%" alt="%ALT_TEXT%" style="%IMAGE_STYLE%">',
    supportedTokens: ['FIRSTNAME', 'LASTNAME', 'EMAIL', 'COMPANY', 'PHONE', 'CITY', 'STATE'],
    apiEndpoints: {
      sendEmail: 'https://youraccount.api-us1.com/api/3/emails/{email_id}/send',
      createContact: 'https://youraccount.api-us1.com/api/3/contacts',
      updateContact: 'https://youraccount.api-us1.com/api/3/contacts/{contact_id}',
      getContacts: 'https://youraccount.api-us1.com/api/3/contacts'
    },
    authentication: {
      type: 'api_key',
      requiredFields: ['api_key', 'account_name']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 500,
      maxEmailsPerHour: 5000,
      maxMergeTags: 25
    }
  },

  constantcontact: {
    name: 'constantcontact',
    displayName: 'Constant Contact',
    category: 'marketing',
    mergeTagFormat: '[TOKEN]',
    imageTagFormat: '<img src="[IMAGE_URL]" alt="[ALT_TEXT]" style="[IMAGE_STYLE]">',
    supportedTokens: ['First Name', 'Last Name', 'Email', 'Company Name', 'Job Title', 'Phone', 'Address'],
    apiEndpoints: {
      sendEmail: 'https://api.constantcontact.com/v2/emailmarketing/campaigns/{campaign_id}/send',
      createContact: 'https://api.constantcontact.com/v2/contacts',
      updateContact: 'https://api.constantcontact.com/v2/contacts/{contact_id}',
      getContacts: 'https://api.constantcontact.com/v2/contacts'
    },
    authentication: {
      type: 'oauth',
      requiredFields: ['access_token', 'refresh_token']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 500,
      maxEmailsPerHour: 10000,
      maxMergeTags: 20
    }
  },

  // Transactional Email Services
  postmark: {
    name: 'postmark',
    displayName: 'Postmark',
    category: 'transactional',
    mergeTagFormat: '{{TOKEN}}',
    imageTagFormat: '<img src="{{IMAGE_URL}}" alt="{{ALT_TEXT}}" style="{{IMAGE_STYLE}}">',
    supportedTokens: ['first_name', 'last_name', 'email', 'company', 'custom_fields'],
    apiEndpoints: {
      sendEmail: 'https://api.postmarkapp.com/email'
    },
    authentication: {
      type: 'api_key',
      requiredFields: ['server_token']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: false,
      segmentation: false
    },
    limits: {
      maxRecipients: 50,
      maxEmailsPerHour: 10000,
      maxMergeTags: 100
    }
  },

  mailgun: {
    name: 'mailgun',
    displayName: 'Mailgun',
    category: 'transactional',
    mergeTagFormat: '%recipient.TOKEN%',
    imageTagFormat: '<img src="%recipient.IMAGE_URL%" alt="%recipient.ALT_TEXT%" style="%recipient.IMAGE_STYLE%">',
    supportedTokens: ['first_name', 'last_name', 'email', 'company', 'custom_variables'],
    apiEndpoints: {
      sendEmail: 'https://api.mailgun.net/v3/{domain}/messages'
    },
    authentication: {
      type: 'basic_auth',
      requiredFields: ['api_key', 'domain']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: false
    },
    limits: {
      maxRecipients: 1000,
      maxEmailsPerHour: 50000,
      maxMergeTags: 100
    }
  },

  // CRM Systems with Email
  salesforce: {
    name: 'salesforce',
    displayName: 'Salesforce Marketing Cloud',
    category: 'crm',
    mergeTagFormat: '%%TOKEN%%',
    imageTagFormat: '<img src="%%IMAGE_URL%%" alt="%%ALT_TEXT%%" style="%%IMAGE_STYLE%%">',
    supportedTokens: ['FirstName', 'LastName', 'Email', 'Company', 'Phone', 'City', 'State', 'Country'],
    apiEndpoints: {
      sendEmail: 'https://api.salesforce.com/services/data/v52.0/actions/standard/emailSimple',
      createContact: 'https://api.salesforce.com/services/data/v52.0/sobjects/Contact',
      updateContact: 'https://api.salesforce.com/services/data/v52.0/sobjects/Contact/{contact_id}',
      getContacts: 'https://api.salesforce.com/services/data/v52.0/query'
    },
    authentication: {
      type: 'oauth',
      requiredFields: ['client_id', 'client_secret', 'access_token', 'refresh_token']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 5000,
      maxEmailsPerHour: 50000,
      maxMergeTags: 100
    }
  },

  // Additional Marketing ESPs
  drip: {
    name: 'drip',
    displayName: 'Drip',
    category: 'marketing',
    mergeTagFormat: '{{ subscriber.TOKEN }}',
    imageTagFormat: '<img src="{{IMAGE_URL}}" alt="{{ALT_TEXT}}" style="{{IMAGE_STYLE}}">',
    supportedTokens: ['first_name', 'last_name', 'email', 'phone', 'address', 'custom_fields'],
    apiEndpoints: {
      sendEmail: 'https://api.getdrip.com/v2/campaigns/{campaign_id}/send',
      createContact: 'https://api.getdrip.com/v2/subscribers',
      updateContact: 'https://api.getdrip.com/v2/subscribers/{subscriber_id}',
      getContacts: 'https://api.getdrip.com/v2/subscribers'
    },
    authentication: {
      type: 'api_key',
      requiredFields: ['api_token', 'account_id']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 1000,
      maxEmailsPerHour: 50000,
      maxMergeTags: 50
    }
  },

  convertkit: {
    name: 'convertkit',
    displayName: 'ConvertKit',
    category: 'marketing',
    mergeTagFormat: '{{ subscriber.TOKEN }}',
    imageTagFormat: '<img src="{{IMAGE_URL}}" alt="{{ALT_TEXT}}" style="{{IMAGE_STYLE}}">',
    supportedTokens: ['first_name', 'last_name', 'email', 'custom_fields'],
    apiEndpoints: {
      sendEmail: 'https://api.convertkit.com/v3/broadcasts/{broadcast_id}/send',
      createContact: 'https://api.convertkit.com/v3/subscribers',
      updateContact: 'https://api.convertkit.com/v3/subscribers/{subscriber_id}',
      getContacts: 'https://api.convertkit.com/v3/subscribers'
    },
    authentication: {
      type: 'api_key',
      requiredFields: ['api_secret']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 500,
      maxEmailsPerHour: 10000,
      maxMergeTags: 25
    }
  },

  mailerlite: {
    name: 'mailerlite',
    displayName: 'MailerLite',
    category: 'marketing',
    mergeTagFormat: '{$TOKEN}',
    imageTagFormat: '<img src="{$IMAGE_URL}" alt="{$ALT_TEXT}" style="{$IMAGE_STYLE}">',
    supportedTokens: ['name', 'email', 'company', 'city', 'country', 'custom_fields'],
    apiEndpoints: {
      sendEmail: 'https://api.mailerlite.com/api/v2/campaigns/{campaign_id}/send',
      createContact: 'https://api.mailerlite.com/api/v2/subscribers',
      updateContact: 'https://api.mailerlite.com/api/v2/subscribers/{subscriber_id}',
      getContacts: 'https://api.mailerlite.com/api/v2/subscribers'
    },
    authentication: {
      type: 'api_key',
      requiredFields: ['api_key']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 1000,
      maxEmailsPerHour: 12000,
      maxMergeTags: 30
    }
  },

  getresponse: {
    name: 'getresponse',
    displayName: 'GetResponse',
    category: 'marketing',
    mergeTagFormat: '[[TOKEN]]',
    imageTagFormat: '<img src="[[IMAGE_URL]]" alt="[[ALT_TEXT]]" style="[[IMAGE_STYLE]]">',
    supportedTokens: ['name', 'email', 'company', 'phone', 'city', 'country', 'custom_fields'],
    apiEndpoints: {
      sendEmail: 'https://api.getresponse.com/v3/newsletters/{newsletter_id}/send',
      createContact: 'https://api.getresponse.com/v3/contacts',
      updateContact: 'https://api.getresponse.com/v3/contacts/{contact_id}',
      getContacts: 'https://api.getresponse.com/v3/contacts'
    },
    authentication: {
      type: 'api_key',
      requiredFields: ['api_key']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 1000,
      maxEmailsPerHour: 20000,
      maxMergeTags: 40
    }
  },

  campaignmonitor: {
    name: 'campaignmonitor',
    displayName: 'Campaign Monitor',
    category: 'marketing',
    mergeTagFormat: '[TOKEN]',
    imageTagFormat: '<img src="[IMAGE_URL]" alt="[ALT_TEXT]" style="[IMAGE_STYLE]">',
    supportedTokens: ['FirstName', 'LastName', 'Email', 'Company', 'Phone', 'custom_fields'],
    apiEndpoints: {
      sendEmail: 'https://api.createsend.com/api/v3.2/campaigns/{campaign_id}/send',
      createContact: 'https://api.createsend.com/api/v3.2/subscribers/{list_id}.json',
      updateContact: 'https://api.createsend.com/api/v3.2/subscribers/{list_id}.json',
      getContacts: 'https://api.createsend.com/api/v3.2/subscribers/{list_id}.json'
    },
    authentication: {
      type: 'api_key',
      requiredFields: ['api_key']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 1000,
      maxEmailsPerHour: 25000,
      maxMergeTags: 50
    }
  },

  // Additional Transactional ESPs
  sparkpost: {
    name: 'sparkpost',
    displayName: 'SparkPost',
    category: 'transactional',
    mergeTagFormat: '{{TOKEN}}',
    imageTagFormat: '<img src="{{IMAGE_URL}}" alt="{{ALT_TEXT}}" style="{{IMAGE_STYLE}}">',
    supportedTokens: ['first_name', 'last_name', 'email', 'company', 'custom_fields'],
    apiEndpoints: {
      sendEmail: 'https://api.sparkpost.com/api/v1/transmissions'
    },
    authentication: {
      type: 'api_key',
      requiredFields: ['api_key']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: false
    },
    limits: {
      maxRecipients: 1000,
      maxEmailsPerHour: 100000,
      maxMergeTags: 100
    }
  },

  socketlabs: {
    name: 'socketlabs',
    displayName: 'SocketLabs',
    category: 'transactional',
    mergeTagFormat: '%%TOKEN%%',
    imageTagFormat: '<img src="%%IMAGE_URL%%" alt="%%ALT_TEXT%%" style="%%IMAGE_STYLE%%">',
    supportedTokens: ['first_name', 'last_name', 'email', 'company', 'custom_fields'],
    apiEndpoints: {
      sendEmail: 'https://api.socketlabs.com/v2/messages'
    },
    authentication: {
      type: 'basic_auth',
      requiredFields: ['server_id', 'api_key']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: false
    },
    limits: {
      maxRecipients: 100,
      maxEmailsPerHour: 10000,
      maxMergeTags: 50
    }
  },

  sendinblue: {
    name: 'sendinblue',
    displayName: 'Sendinblue (Brevo)',
    category: 'marketing',
    mergeTagFormat: '{{ contact.TOKEN }}',
    imageTagFormat: '<img src="{{IMAGE_URL}}" alt="{{ALT_TEXT}}" style="{{IMAGE_STYLE}}">',
    supportedTokens: ['FIRSTNAME', 'LASTNAME', 'EMAIL', 'COMPANY', 'SMS', 'custom_attributes'],
    apiEndpoints: {
      sendEmail: 'https://api.sendinblue.com/v3/emailCampaigns/{campaign_id}/sendNow',
      createContact: 'https://api.sendinblue.com/v3/contacts',
      updateContact: 'https://api.sendinblue.com/v3/contacts/{contact_id}',
      getContacts: 'https://api.sendinblue.com/v3/contacts'
    },
    authentication: {
      type: 'api_key',
      requiredFields: ['api_key']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 1000,
      maxEmailsPerHour: 30000,
      maxMergeTags: 40
    }
  },

  // CRM Systems with Email
  zoho: {
    name: 'zoho',
    displayName: 'Zoho CRM',
    category: 'crm',
    mergeTagFormat: '${TOKEN}',
    imageTagFormat: '<img src="${IMAGE_URL}" alt="${ALT_TEXT}" style="${IMAGE_STYLE}">',
    supportedTokens: ['First Name', 'Last Name', 'Email', 'Company', 'Phone', 'City', 'State', 'Country'],
    apiEndpoints: {
      sendEmail: 'https://www.zohoapis.com/crm/v2/{module}/actions/send_mail',
      createContact: 'https://www.zohoapis.com/crm/v2/{module}',
      updateContact: 'https://www.zohoapis.com/crm/v2/{module}/{record_id}',
      getContacts: 'https://www.zohoapis.com/crm/v2/{module}'
    },
    authentication: {
      type: 'oauth',
      requiredFields: ['client_id', 'client_secret', 'access_token', 'refresh_token']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 100,
      maxEmailsPerHour: 1000,
      maxMergeTags: 30
    }
  },

  pipedrive: {
    name: 'pipedrive',
    displayName: 'Pipedrive',
    category: 'crm',
    mergeTagFormat: '{{TOKEN}}',
    imageTagFormat: '<img src="{{IMAGE_URL}}" alt="{{ALT_TEXT}}" style="{{IMAGE_STYLE}}">',
    supportedTokens: ['name', 'email', 'phone', 'company', 'custom_fields'],
    apiEndpoints: {
      sendEmail: 'https://api.pipedrive.com/v1/mailbox/mail/send',
      createContact: 'https://api.pipedrive.com/v1/persons',
      updateContact: 'https://api.pipedrive.com/v1/persons/{person_id}',
      getContacts: 'https://api.pipedrive.com/v1/persons'
    },
    authentication: {
      type: 'api_key',
      requiredFields: ['api_token']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 100,
      maxEmailsPerHour: 1000,
      maxMergeTags: 20
    }
  },

  // Google Workspace
  gmail: {
    name: 'gmail',
    displayName: 'Gmail',
    category: 'transactional',
    mergeTagFormat: '{{TOKEN}}',
    imageTagFormat: '<img src="{{IMAGE_URL}}" alt="{{ALT_TEXT}}" style="{{IMAGE_STYLE}}">',
    supportedTokens: ['first_name', 'last_name', 'email', 'company', 'phone', 'city', 'state'],
    features: {
      mergeTags: false,
      dynamicContent: false,
      apiIntegration: true,
      webhooks: false,
      templates: false,
      segmentation: false
    }
  },

  outlook: {
    name: 'outlook',
    displayName: 'Outlook',
    category: 'transactional',
    mergeTagFormat: '{{TOKEN}}',
    imageTagFormat: '<img src="{{IMAGE_URL}}" alt="{{ALT_TEXT}}" style="{{IMAGE_STYLE}}">',
    supportedTokens: ['first_name', 'last_name', 'email', 'company', 'job_title', 'phone'],
    features: {
      mergeTags: false,
      dynamicContent: false,
      apiIntegration: true,
      webhooks: false,
      templates: false,
      segmentation: false
    }
  },

  // Additional ESPs
  omnisend: {
    name: 'omnisend',
    displayName: 'Omnisend',
    category: 'marketing',
    mergeTagFormat: '{{ contact.TOKEN }}',
    imageTagFormat: '<img src="{{IMAGE_URL}}" alt="{{ALT_TEXT}}" style="{{IMAGE_STYLE}}">',
    supportedTokens: ['firstName', 'lastName', 'email', 'phone', 'country', 'custom_properties'],
    apiEndpoints: {
      sendEmail: 'https://api.omnisend.com/v3/campaigns/{campaign_id}/send',
      createContact: 'https://api.omnisend.com/v3/contacts',
      updateContact: 'https://api.omnisend.com/v3/contacts/{contact_id}',
      getContacts: 'https://api.omnisend.com/v3/contacts'
    },
    authentication: {
      type: 'api_key',
      requiredFields: ['api_key']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 1000,
      maxEmailsPerHour: 15000,
      maxMergeTags: 30
    }
  },

  reallysimplesystems: {
    name: 'reallysimplesystems',
    displayName: 'Really Simple Systems',
    category: 'crm',
    mergeTagFormat: '[TOKEN]',
    imageTagFormat: '<img src="[IMAGE_URL]" alt="[ALT_TEXT]" style="[IMAGE_STYLE]">',
    supportedTokens: ['FirstName', 'LastName', 'Email', 'Company', 'Phone', 'custom_fields'],
    apiEndpoints: {
      sendEmail: 'https://api.reallysimplesystems.com/v1/emails/send',
      createContact: 'https://api.reallysimplesystems.com/v1/contacts',
      updateContact: 'https://api.reallysimplesystems.com/v1/contacts/{contact_id}',
      getContacts: 'https://api.reallysimplesystems.com/v1/contacts'
    },
    authentication: {
      type: 'api_key',
      requiredFields: ['api_key', 'account_id']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 100,
      maxEmailsPerHour: 1000,
      maxMergeTags: 20
    }
  },

  moosend: {
    name: 'moosend',
    displayName: 'Moosend',
    category: 'marketing',
    mergeTagFormat: '[TOKEN]',
    imageTagFormat: '<img src="[IMAGE_URL]" alt="[ALT_TEXT]" style="[IMAGE_STYLE]">',
    supportedTokens: ['Name', 'Email', 'Company', 'Phone', 'custom_fields'],
    apiEndpoints: {
      sendEmail: 'https://api.moosend.com/v3/campaigns/{campaign_id}/send',
      createContact: 'https://api.moosend.com/v3/subscribers/{mailing_list_id}/subscribe.json',
      updateContact: 'https://api.moosend.com/v3/subscribers/{mailing_list_id}/update/{email}.json',
      getContacts: 'https://api.moosend.com/v3/subscribers/{mailing_list_id}/members.json'
    },
    authentication: {
      type: 'api_key',
      requiredFields: ['api_key']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 1000,
      maxEmailsPerHour: 20000,
      maxMergeTags: 30
    }
  },

  customerio: {
    name: 'customerio',
    displayName: 'Customer.io',
    category: 'marketing',
    mergeTagFormat: '{{customer.TOKEN}}',
    imageTagFormat: '<img src="{{IMAGE_URL}}" alt="{{ALT_TEXT}}" style="{{IMAGE_STYLE}}">',
    supportedTokens: ['first_name', 'last_name', 'email', 'company', 'custom_attributes'],
    apiEndpoints: {
      sendEmail: 'https://api.customer.io/v1/campaigns/{campaign_id}/triggers',
      createContact: 'https://api.customer.io/v1/customers/{customer_id}',
      updateContact: 'https://api.customer.io/v1/customers/{customer_id}',
      getContacts: 'https://api.customer.io/v1/customers'
    },
    authentication: {
      type: 'basic_auth',
      requiredFields: ['site_id', 'api_key']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 1000,
      maxEmailsPerHour: 50000,
      maxMergeTags: 100
    }
  },

  iterables: {
    name: 'iterables',
    displayName: 'Iterable',
    category: 'marketing',
    mergeTagFormat: '{{user.TOKEN}}',
    imageTagFormat: '<img src="{{IMAGE_URL}}" alt="{{ALT_TEXT}}" style="{{IMAGE_STYLE}}">',
    supportedTokens: ['firstName', 'lastName', 'email', 'phone', 'customAttributes'],
    apiEndpoints: {
      sendEmail: 'https://api.iterable.com/api/campaigns/send',
      createContact: 'https://api.iterable.com/api/users/update',
      updateContact: 'https://api.iterable.com/api/users/update',
      getContacts: 'https://api.iterable.com/api/users/get'
    },
    authentication: {
      type: 'api_key',
      requiredFields: ['api_key']
    },
    features: {
      mergeTags: true,
      dynamicContent: true,
      apiIntegration: true,
      webhooks: true,
      templates: true,
      segmentation: true
    },
    limits: {
      maxRecipients: 1000,
      maxEmailsPerHour: 100000,
      maxMergeTags: 100
    }
  }
};

export type ESPName = keyof typeof ESP_DATABASE;

/**
 * ESP Manager Class
 */
export class ESPManager {
  private configs: Map<string, ESPConfig> = new Map();
  private connections: Map<string, any> = new Map();

  constructor() {
    // Initialize with built-in ESPs
    Object.entries(ESP_DATABASE).forEach(([name, config]) => {
      this.configs.set(name, config);
    });
  }

  /**
   * Register a custom ESP
   */
  registerESP(name: string, config: ESPConfig): void {
    this.configs.set(name, config);
  }

  /**
   * Get ESP configuration
   */
  getESP(name: string): ESPConfig | undefined {
    return this.configs.get(name);
  }

  /**
   * List all available ESPs
   */
  listESPs(category?: ESPConfig['category']): ESPConfig[] {
    const allESPs = Array.from(this.configs.values());
    return category ? allESPs.filter(esp => esp.category === category) : allESPs;
  }

  /**
   * Connect to ESP with credentials
   */
  async connectESP(name: string, credentials: Record<string, string>): Promise<boolean> {
    const config = this.configs.get(name);
    if (!config) {
      throw new Error(`ESP ${name} not found`);
    }

    // Validate required credentials
    const requiredFields = config.authentication?.requiredFields || [];
    const missingFields = requiredFields.filter(field => !credentials[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required credentials: ${missingFields.join(', ')}`);
    }

    // Store connection (in real implementation, this would establish actual API connection)
    this.connections.set(name, {
      credentials,
      connectedAt: new Date(),
      config
    });

    return true;
  }

  /**
   * Convert personalization tokens to ESP merge tags
   */
  convertToMergeTags(
    content: string,
    espName: string,
    tokenMapping?: Record<string, string>
  ): string {
    const config = this.configs.get(espName);
    if (!config) {
      throw new Error(`ESP ${espName} not configured`);
    }

    let convertedContent = content;

    // Default token mapping
    const defaultMapping: Record<string, string> = {
      'FIRSTNAME': 'first_name',
      'LASTNAME': 'last_name',
      'EMAIL': 'email',
      'COMPANY': 'company',
      'JOBTITLE': 'job_title',
      'PHONE': 'phone',
      'CITY': 'city',
      'STATE': 'state',
      'COUNTRY': 'country'
    };

    const mapping = { ...defaultMapping, ...tokenMapping };

    // Replace tokens with ESP merge tags
    Object.entries(mapping).forEach(([ourToken, espToken]) => {
      const ourPattern = new RegExp(`\\[${ourToken}\\]`, 'g');
      let espTag: string;

      switch (espName) {
        case 'mailchimp':
          espTag = `*|${espToken}|*`;
          break;
        case 'klaviyo':
          espTag = `{{ person|lookup:"${espToken}" }}`;
          break;
        case 'hubspot':
          espTag = `{{contact.${espToken}}}`;
          break;
        case 'activecampaign':
          espTag = `%${espToken}%`;
          break;
        case 'constantcontact':
          espTag = `[${espToken}]`;
          break;
        case 'salesforce':
          espTag = `%%${espToken}%%`;
          break;
        case 'mailgun':
          espTag = `%recipient.${espToken}%`;
          break;
        default:
          espTag = `{{${espToken}}}`;
      }

      convertedContent = convertedContent.replace(ourPattern, espTag);
    });

    return convertedContent;
  }

  /**
   * Generate personalized email content for ESP
   */
  generatePersonalizedContent(
    template: string,
    recipientData: Record<string, string>,
    espName: string,
    imageUrl?: string,
    options?: {
      altText?: string;
      imageStyle?: string;
      customTokens?: Record<string, string>;
    }
  ): {
    emailContent: string;
    personalizedImageUrl?: string;
    resolvedTokens: string[];
    warnings: string[];
  } {
    const config = this.configs.get(espName);
    if (!config) {
      throw new Error(`ESP ${espName} not configured`);
    }

    const { altText = 'Personalized Image', imageStyle = '', customTokens = {} } = options || {};

    // Resolve tokens in template
    const tokenResolution = resolveTokens(
      template,
      { ...recipientData, ...customTokens },
      { contentType: 'email', preserveUnresolved: true }
    );

    // Convert to ESP merge tags
    let emailContent = this.convertToMergeTags(tokenResolution.resolvedContent, espName);

    // Handle personalized image
    let personalizedImageUrl: string | undefined;

    if (imageUrl) {
      // Generate personalized image URL with recipient data
      const url = new URL(imageUrl);
      Object.entries(recipientData).forEach(([key, value]) => {
        if (config.supportedTokens.includes(key) || key.startsWith('custom_')) {
          url.searchParams.set(key.toLowerCase(), encodeURIComponent(value));
        }
      });
      personalizedImageUrl = url.toString();

      // Create ESP-specific image tag
      let imageTag = config.imageTagFormat
        .replace(/\{\{IMAGE_URL\}\}|\*|IMAGE_URL\|\*|\%IMAGE_URL\%|\[IMAGE_URL\]/g, personalizedImageUrl)
        .replace(/\{\{ALT_TEXT\}\}|\*|ALT_TEXT\|\*|\%ALT_TEXT\%|\[ALT_TEXT\]/g, altText);

      if (imageStyle) {
        imageTag = imageTag.replace(
          /\{\{IMAGE_STYLE\}\}|\*|IMAGE_STYLE\|\*|\%IMAGE_STYLE\%|\[IMAGE_STYLE\]/g,
          imageStyle
        );
      }

      // Replace placeholder with actual image tag
      emailContent = emailContent.replace('[PERSONALIZED_IMAGE]', imageTag);
    }

    return {
      emailContent,
      personalizedImageUrl,
      resolvedTokens: tokenResolution.resolvedTokens,
      warnings: tokenResolution.warnings
    };
  }

  /**
   * Validate ESP compatibility
   */
  validateESPCompatibility(
    content: string,
    espName: string
  ): {
    isCompatible: boolean;
    supportedTokens: string[];
    unsupportedTokens: string[];
    recommendations: string[];
    limits: {
      withinLimits: boolean;
      issues: string[];
    };
  } {
    const config = this.configs.get(espName);
    if (!config) {
      throw new Error(`ESP ${espName} not configured`);
    }

    const validation = validateTokens(content, 'email');

    const supportedTokens = validation.validTokens.filter(token =>
      config.supportedTokens.includes(token) ||
      PERSONALIZATION_TOKENS.some(pt => pt.key === token && pt.isImplemented)
    );

    const unsupportedTokens = validation.validTokens.filter(token =>
      !config.supportedTokens.includes(token) &&
      !PERSONALIZATION_TOKENS.some(pt => pt.key === token && pt.isImplemented)
    );

    const recommendations: string[] = [];
    if (unsupportedTokens.length > 0) {
      recommendations.push(`Consider using these ${config.displayName} supported tokens: ${config.supportedTokens.join(', ')}`);
    }

    // Check limits
    const limits = config.limits || {};
    const limitIssues: string[] = [];

    if (limits.maxMergeTags && validation.validTokens.length > limits.maxMergeTags) {
      limitIssues.push(`Too many merge tags (${validation.validTokens.length}). ${config.displayName} supports max ${limits.maxMergeTags}.`);
    }

    return {
      isCompatible: unsupportedTokens.length === 0,
      supportedTokens,
      unsupportedTokens,
      recommendations,
      limits: {
        withinLimits: limitIssues.length === 0,
        issues: limitIssues
      }
    };
  }

  /**
   * Generate ESP setup documentation
   */
  generateSetupGuide(espName: string): string {
    const config = this.configs.get(espName);
    if (!config) {
      throw new Error(`ESP ${espName} not configured`);
    }

    return `
# ${config.displayName} Integration Setup Guide

## Overview
${config.displayName} is a ${config.category} email service provider with the following capabilities:
${Object.entries(config.features).map(([feature, enabled]) =>
  `- ${feature}: ${enabled ? '✓' : '✗'}`
).join('\n')}

## Merge Tag Format
${config.displayName} uses: \`${config.mergeTagFormat}\`

## Supported Tokens
${config.supportedTokens.map(token => `- \`${token}\``).join('\n')}

## Authentication
**Type:** ${config.authentication?.type || 'Not specified'}
**Required Fields:** ${config.authentication?.requiredFields?.join(', ') || 'None'}

## API Endpoints
${config.apiEndpoints ? Object.entries(config.apiEndpoints).map(([action, url]) =>
  `- ${action}: \`${url}\``
).join('\n') : 'No API endpoints configured'}

## Limits
${config.limits ? Object.entries(config.limits).map(([limit, value]) =>
  `- ${limit}: ${value}`
).join('\n') : 'No specific limits'}

## Setup Steps
1. Create an account with ${config.displayName}
2. Generate API credentials
3. Configure merge tags in your email templates
4. Test with sample data
5. Set up webhooks for tracking (if supported)

## Example Template
\`\`\`html
Hello ${config.mergeTagFormat.replace('TOKEN', 'first_name')},

Here's your personalized content:

[PERSONALIZED_IMAGE]

Best regards,
Your Company
\`\`\`
`;
  }

  /**
   * Batch process emails for multiple recipients
   */
  batchProcessEmails(
    template: string,
    recipients: Array<{
      email: string;
      data: Record<string, string>;
      imageUrl?: string;
    }>,
    espName: string,
    options?: {
      altText?: string;
      imageStyle?: string;
    }
  ): Array<{
    email: string;
    content: string;
    imageUrl?: string;
    resolvedTokens: string[];
    warnings: string[];
  }> {
    return recipients.map(recipient => {
      const result = this.generatePersonalizedContent(
        template,
        recipient.data,
        espName,
        recipient.imageUrl,
        options
      );

      return {
        email: recipient.email,
        content: result.emailContent,
        imageUrl: result.personalizedImageUrl,
        resolvedTokens: result.resolvedTokens,
        warnings: result.warnings
      };
    });
  }
}

// Export singleton instance
export const espManager = new ESPManager();
export default espManager;