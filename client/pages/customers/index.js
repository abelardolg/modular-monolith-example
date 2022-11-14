import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
} from '@chakra-ui/react'
import SidebarWithHeader from '../../src/component/sidebar/sidebar'
import { useSelector } from 'react-redux'
import { searchCustomers } from '../../src/service/api/customer/customer.service'
import { useCallback, useEffect, useState } from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react'
import InfiniteScroll from '../../src/component/common/infinite-scroll'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

export default function Customers() {
  const id = useSelector((state) => state.auth.id)
  const [customers, setCustomers] = useState([])
  const [meta, setMeta] = useState({
    page: 1,
    limit: 30,
    hasNext: false,
    total: 0,
  })
  const [filters, setFilters] = useState({
    name: '',
  })
  const [sorting, setSorting] = useState({
    sort: 'name',
    order: 'asc',
  })

  const buildFilters = useCallback(
    (page, limit) => {
      let result = `?page=${page}&limit=${limit}&sort=${sorting.sort}&order=${sorting.order}`

      if ('' !== filters.name) {
        result += `&name=${filters.name}`
      }

      return result
    },
    [filters, sorting],
  )

  const search = useCallback(
    async (page = 1, limit = 30, loadMore = false) => {
      try {
        const response = await searchCustomers(id, buildFilters(page, limit))
        setCustomers(
          loadMore
            ? customers.concat(response.data.items)
            : response.data.items,
        )
        setMeta(response.data.meta)
      } catch (e) {
        console.log(e)
      }
    },
    [id, customers, buildFilters],
  )

  useEffect(() => {
    search()
  }, [filters, sorting]) // eslint-disable-line

  return (
    <SidebarWithHeader>
      <Heading>Customers list</Heading>
      <Flex display={{ md: 'flex' }} alignItems="start" mt={5} mb={5}>
        <Box>
          <FormControl>
            <Input
              name="name"
              size="lg"
              type="search"
              placeholder="Customer name..."
              onChange={(e) => {
                if ('' === e.target.value) {
                  setFilters((prevState) => {
                    return {
                      ...prevState,
                      name: e.target.value,
                    }
                  })
                }
              }}
              onKeyDown={(e) => {
                if (e.code === 'Enter') {
                  setFilters((prevState) => {
                    return {
                      ...prevState,
                      name: e.target.value,
                    }
                  })
                }
              }}
            />
          </FormControl>
        </Box>
      </Flex>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>
                Name
                <Icon
                  style={{
                    display: sorting.sort === 'name' ? 'inline' : 'none',
                  }}
                  as={sorting.order === 'asc' ? FiChevronDown : FiChevronUp}
                  onClick={() => {
                    setSorting((prevState) => {
                      return {
                        ...prevState,
                        sort: 'name',
                        order: 'asc' === prevState.order ? 'desc' : 'asc',
                      }
                    })
                  }}
                />
              </Th>
              <Th>Address</Th>
            </Tr>
          </Thead>
          <Tbody>
            {customers.map((customer) => (
              <Tr key={customer.id}>
                <Td>{customer.id}</Td>
                <Td>{customer.name}</Td>
                <Td>{customer.address}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <InfiniteScroll meta={meta} collection={customers} search={search} />
    </SidebarWithHeader>
  )
}
