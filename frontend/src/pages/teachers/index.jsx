import { List, Create, Edit, Show, useTable, useForm, useShow, DeleteButton, EditButton, ShowButton, CreateButton, SaveButton } from '@refinedev/antd'
import { useMany } from '@refinedev/core'
import { Table, Space, Form, Input, Select, InputNumber, Tag, Descriptions, Typography } from 'antd'
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons'

const { Text } = Typography

export const TeacherList = () => {
  const { tableProps } = useTable({ syncWithLocation: true })
  return (
    <List>
      <Table {...tableProps} rowKey="id" scroll={{ x: true }}>
        <Table.Column dataIndex="name" title="الاسم" />
        <Table.Column dataIndex="phone" title="الجوال" />
        <Table.Column dataIndex="email" title="البريد" />
        <Table.Column dataIndex="subject" title="المادة" />
        <Table.Column dataIndex="hourly_rate" title="سعر الساعة" render={(v) => v ? `${v} جنيه` : '-'} />
        <Table.Column dataIndex="status" title="الحالة" render={(v) => <Tag color={v === 'active' ? 'green' : 'red'}>{v === 'active' ? 'نشط' : 'غير نشط'}</Tag>} />
        <Table.Column title="إجراءات" render={(_, r) => <Space><ShowButton hideText size="small" recordItemId={r.id} /><EditButton hideText size="small" recordItemId={r.id} /><DeleteButton hideText size="small" recordItemId={r.id} /></Space>} />
      </Table>
    </List>
  )
}

export const TeacherCreate = () => {
  const { formProps, saveButtonProps } = useForm()
  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="اسم المعلم" name="name" rules={[{ required: true }]}><Input prefix={<UserOutlined />} /></Form.Item>
        <Form.Item label="رقم الجوال" name="phone"><Input prefix={<PhoneOutlined />} /></Form.Item>
        <Form.Item label="البريد الإلكتروني" name="email"><Input prefix={<MailOutlined />} /></Form.Item>
        <Form.Item label="المادة / التخصص" name="subject"><Input /></Form.Item>
        <Form.Item label="سعر الساعة (جنيه)" name="hourly_rate"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        <Form.Item label="نسبة العمولة %" name="commission_rate"><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item>
        <Form.Item label="الحالة" name="status" initialValue="active">
          <Select options={[{ value: 'active', label: 'نشط' }, { value: 'inactive', label: 'غير نشط' }]} />
        </Form.Item>
        <Form.Item label="ملاحظات" name="notes"><Input.TextArea rows={3} /></Form.Item>
      </Form>
    </Create>
  )
}

export const TeacherEdit = () => {
  const { formProps, saveButtonProps } = useForm()
  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="اسم المعلم" name="name" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="رقم الجوال" name="phone"><Input /></Form.Item>
        <Form.Item label="البريد الإلكتروني" name="email"><Input /></Form.Item>
        <Form.Item label="المادة / التخصص" name="subject"><Input /></Form.Item>
        <Form.Item label="سعر الساعة (جنيه)" name="hourly_rate"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        <Form.Item label="نسبة العمولة %" name="commission_rate"><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item>
        <Form.Item label="الحالة" name="status">
          <Select options={[{ value: 'active', label: 'نشط' }, { value: 'inactive', label: 'غير نشط' }]} />
        </Form.Item>
        <Form.Item label="ملاحظات" name="notes"><Input.TextArea rows={3} /></Form.Item>
      </Form>
    </Edit>
  )
}

export const TeacherShow = () => {
  const { queryResult } = useShow()
  const { data, isLoading } = queryResult
  const record = data?.data
  return (
    <Show isLoading={isLoading}>
      <Descriptions bordered column={2}>
        <Descriptions.Item label="الاسم">{record?.name}</Descriptions.Item>
        <Descriptions.Item label="الجوال">{record?.phone}</Descriptions.Item>
        <Descriptions.Item label="البريد">{record?.email}</Descriptions.Item>
        <Descriptions.Item label="المادة">{record?.subject}</Descriptions.Item>
        <Descriptions.Item label="سعر الساعة">{record?.hourly_rate} جنيه</Descriptions.Item>
        <Descriptions.Item label="نسبة العمولة">{record?.commission_rate}%</Descriptions.Item>
        <Descriptions.Item label="الحالة"><Tag color={record?.status === 'active' ? 'green' : 'red'}>{record?.status === 'active' ? 'نشط' : 'غير نشط'}</Tag></Descriptions.Item>
        <Descriptions.Item label="ملاحظات" span={2}>{record?.notes}</Descriptions.Item>
      </Descriptions>
    </Show>
  )
}
