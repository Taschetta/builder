import { describe, it, expect } from "vitest"
import { format } from "sqlstring"
import useBuilder from "../src/builder.js"

const build = useBuilder({ format })

describe("the build(expression) function", () => {

  describe("when the expression is empty", () => {
    
    it("returns an empty string", () => {
      expect(build()).toEqual("")
      expect(build({})).toEqual("")
    })
    
  })
  
  describe("when the expression contains an $select operator", () => {

    it("returns a select statement", () => {
      const result = build({
        $select: "table"
      })

      expect(result).toEqual("SELECT * FROM `table`")
    })

    describe("and the expression also contains a $columns operator", () => {

      it("selects only the specified columns", () => {
        const result = build({
          $select: "table",
          $columns: ["id", "name"],
        })
  
        expect(result).toEqual("SELECT `id`, `name` FROM `table`")        
      })
    })

  })
  
  describe("when the expression contains an $insert operator", () => {
    
    it("returns an empty string", () => {
      const result = build({
        $insert: "table",
      })
      expect(result).toEqual("")
    })

    describe("and the expression also contains a $value operator", () => {

      it("returns an insert statement for the value", () => {
        const result = build({
          $insert: "table",
          $value: {
            id: 0,
            name: "test",
            active: true,
            value: 150,
          }
        })
        expect(result).toEqual("INSERT INTO `table` (`id`, `name`, `active`, `value`) VALUES (0, 'test', true, 150)")
      })

    })

    describe("and the expression also contains a $values operator", () => {

      it("returns an insert statement for the array of values", () => {
        const result = build({
          $insert: "table",
          $values: [
            { id: 0, name: "test-0", active: true, value: 150 },
            { id: 1, name: "test-1", active: true, value: 150 },
            { id: 2, name: "test-2", active: false, value: 1500 },
          ]
        })
        expect(result).toEqual("INSERT INTO `table` (`id`, `name`, `active`, `value`) VALUES (0, 'test-0', true, 150), (1, 'test-1', true, 150), (2, 'test-2', false, 1500)")
      })

    })

  })

  describe("when the expression contains an $update operator", () => {

    it("returns an empty string", () => {
      const result = build({
        $update: 'table',
      })
      expect(result).toEqual("")
    })
    
    describe("and the expression also contains a $set operator", () => {
      
      it("returns an update statement", () => {
        const result = build({
          $update: 'table',
          $set: {
            name: 'Pedro',
            active: false
          }
        })
        expect(result).toEqual("UPDATE `table` SET `name` = 'Pedro', `active` = false")
      })
      
    })
    
  })

  describe("when the expression contains an $delete operator", () => {
    
    it("returns a delete statement", () => {
      const result = build({
        $delete: 'table'
      })
      expect(result).toEqual('DELETE FROM `table`')
    })
    
  })

  describe("when the expression contains a $where operator", () => {

    it("returns an empty string", () => {
      expect(build({ $where: {} })).toEqual('')
    })

  })

  describe("when the expression contains a $limit operator", () => {
    
    it("returns a limit statement", () => {
      expect(build({ $limit: 5 })).toEqual('LIMIT 5')
    })

    describe("and the expression contains a $offset operator", () => {

      it("returns a limit and offset statement ", () => {
        expect(build({ $limit: 5, $offset: 10 })).toEqual('LIMIT 5 OFFSET 10')
      })
      
    })
    
  })

  describe("when the expression contains a $order", () => {
    
    describe("and its value is a string", () => {
      
      it("returns an order by statement", () => {
        expect(build({ $order: 'name' })).toEqual('ORDER BY `name`')
      })

    })

    describe("and its value is an object", () => {
      
      it("returns an empty string", () => {
        expect(build({ $order: {} })).toEqual('')
      })
      
      describe("and it contains a by propertie", () => {
        
        it("returns an order by statement", () => {
          expect(build({ $order: { by: 'name' } })).toEqual('ORDER BY `name`')
        })
        
        describe("and it contains a sort propertie", () => {
  
          describe("and its value is 'asc', 'ascending', 'ASC' or 'ASCENDING'", () => {
            
            it("orders the statement ascending", () => {
              expect(build({ $order: { by: 'table', sort: 'asc' } })).toEqual('ORDER BY `table` ASC')
              expect(build({ $order: { by: 'table', sort: 'ASC' } })).toEqual('ORDER BY `table` ASC')
              expect(build({ $order: { by: 'table', sort: 'ASCENDING' } })).toEqual('ORDER BY `table` ASC')
              expect(build({ $order: { by: 'table', sort: 'ascending' } })).toEqual('ORDER BY `table` ASC')
            })
            
          })

          describe("and its value is 'desc', 'descending', 'DESC' or 'DESCENDING'", () => {
            
            it("orders the statement ascending", () => {
              expect(build({ $order: { by: 'table', sort: 'desc' } })).toEqual('ORDER BY `table` DESC')
              expect(build({ $order: { by: 'table', sort: 'DESC' } })).toEqual('ORDER BY `table` DESC')
              expect(build({ $order: { by: 'table', sort: 'DESCENDING' } })).toEqual('ORDER BY `table` DESC')
              expect(build({ $order: { by: 'table', sort: 'descending' } })).toEqual('ORDER BY `table` DESC')
            })
            
          })
          
          describe("but if its value is some other thing", () => {
            
            it("doesn't orders the statement", () => {
              expect(build({ $order: { by: 'name', sort: 'asc;DROP TABLE `important`;' } })).toEqual('ORDER BY `name`')
            })
            
          })
          
        })

      })

      describe("and it contains a sort propertie", () => {
        
        it("returns an empty string", () => {
          expect(build({ $order: { sort: 'asc' } })).toEqual('')
        })
        
      })
    })
    
  })
  
})