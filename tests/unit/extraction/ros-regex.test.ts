import { extractRosFields } from '@/lib/extraction/ros-regex'

describe('extractRosFields', () => {
  describe('served_at', () => {
    it('extracts "served on [long date]"', () => {
      const text = 'I served on January 15, 2026 the following documents.'
      const result = extractRosFields(text)
      expect(result.served_at).toBe('January 15, 2026')
    })

    it('extracts "date of service: [slash date]"', () => {
      const text = 'Date of service: 01/15/2026'
      const result = extractRosFields(text)
      expect(result.served_at).toBe('01/15/2026')
    })

    it('extracts "executed on [long date]"', () => {
      const text = 'This citation was executed on March 3, 2026 at 10am.'
      const result = extractRosFields(text)
      expect(result.served_at).toBe('March 3, 2026')
    })

    it('extracts ordinal date "on the 15th day of January, 2026"', () => {
      const text = 'Came to hand on the 15th day of January, 2026'
      const result = extractRosFields(text)
      expect(result.served_at).toBe('15th day of January, 2026')
    })
  })

  describe('return_filed_at', () => {
    it('extracts "return filed [date]"', () => {
      const text = 'Return filed January 20, 2026'
      const result = extractRosFields(text)
      expect(result.return_filed_at).toBe('January 20, 2026')
    })

    it('extracts "filed on [date]"', () => {
      const text = 'This return was filed on 02/01/2026 with the court.'
      const result = extractRosFields(text)
      expect(result.return_filed_at).toBe('02/01/2026')
    })
  })

  describe('service_method', () => {
    it('detects personal service via "personally served"', () => {
      const text = 'I personally served the defendant at their residence.'
      const result = extractRosFields(text)
      expect(result.service_method).toBe('personal')
    })

    it('detects personal service via "delivered it in person"', () => {
      const text = 'I delivered it in person to the defendant.'
      const result = extractRosFields(text)
      expect(result.service_method).toBe('personal')
    })

    it('detects substituted service via "suitable age"', () => {
      const text = 'Left with a person of suitable age at the address.'
      const result = extractRosFields(text)
      expect(result.service_method).toBe('substituted')
    })

    it('detects posting via "affixed to the door"', () => {
      const text = 'I affixed to the door of the usual place of abode.'
      const result = extractRosFields(text)
      expect(result.service_method).toBe('posting')
    })

    it('detects certified mail', () => {
      const text = 'Served via certified mail return receipt requested.'
      const result = extractRosFields(text)
      expect(result.service_method).toBe('certified_mail')
    })

    it('detects secretary of state', () => {
      const text = 'Service was made through the Secretary of State.'
      const result = extractRosFields(text)
      expect(result.service_method).toBe('secretary_of_state')
    })

    it('detects publication', () => {
      const text = 'Service by publication was ordered.'
      const result = extractRosFields(text)
      expect(result.service_method).toBe('publication')
    })

    it('returns null for unknown method', () => {
      const text = 'Service was completed by some unknown means.'
      const result = extractRosFields(text)
      expect(result.service_method).toBeNull()
    })
  })

  describe('served_to', () => {
    it('extracts name after "served"', () => {
      const text = 'I served John Michael Smith at their residence.'
      const result = extractRosFields(text)
      expect(result.served_to).toBe('John Michael Smith')
    })

    it('extracts name after "defendant:"', () => {
      const text = 'Defendant: Maria Garcia Lopez'
      const result = extractRosFields(text)
      expect(result.served_to).toBe('Maria Garcia Lopez')
    })
  })

  describe('server_name', () => {
    it('extracts name from "I, [Name], being"', () => {
      const text = 'I, Robert James Wilson, being a duly authorized process server.'
      const result = extractRosFields(text)
      expect(result.server_name).toBe('Robert James Wilson')
    })

    it('extracts name from "Process Server:"', () => {
      const text = 'Process Server: David Allen Brown'
      const result = extractRosFields(text)
      expect(result.server_name).toBe('David Allen Brown')
    })

    it('extracts name from "Officer:"', () => {
      const text = 'Officer: Thomas Lee Davis'
      const result = extractRosFields(text)
      expect(result.server_name).toBe('Thomas Lee Davis')
    })
  })

  describe('edge cases', () => {
    it('returns all nulls for empty text', () => {
      const result = extractRosFields('')
      expect(result).toEqual({
        served_at: null,
        return_filed_at: null,
        service_method: null,
        served_to: null,
        server_name: null,
      })
    })

    it('returns all nulls for whitespace-only text', () => {
      const result = extractRosFields('   \n\t  ')
      expect(result).toEqual({
        served_at: null,
        return_filed_at: null,
        service_method: null,
        served_to: null,
        server_name: null,
      })
    })

    it('returns all nulls for garbage text', () => {
      const result = extractRosFields('asdf 123 !@# random noise')
      expect(result).toEqual({
        served_at: null,
        return_filed_at: null,
        service_method: null,
        served_to: null,
        server_name: null,
      })
    })

    it('extracts multiple fields from realistic ROS text', () => {
      const text = `
        RETURN OF SERVICE
        I, Michael Thomas Rivera, being a duly authorized process server,
        do hereby certify that I personally served Jane Elizabeth Doe
        with the Citation and Petition on January 15, 2026
        at 123 Main Street, Houston, TX 77001.
        Return filed January 20, 2026.
      `
      const result = extractRosFields(text)
      expect(result.served_at).toBe('January 15, 2026')
      expect(result.return_filed_at).toBe('January 20, 2026')
      expect(result.service_method).toBe('personal')
      expect(result.served_to).toBe('Jane Elizabeth Doe')
      expect(result.server_name).toBe('Michael Thomas Rivera')
    })
  })
})
