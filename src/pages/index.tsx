import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { createSwaggerSpec } from 'next-swagger-doc'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export const getStaticProps: GetStaticProps = async () => {
  const spec: Record<string, any> = createSwaggerSpec({
    apiFolder: 'src/pages/api',
    schemaFolders: ['src/models'],
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Kagla API',
        version: '0.0.1',
      },
      tags: [{ name: 'Kagla', description: 'Optimized for Kagla UI' }],
    },
  })
  return { props: { spec } }
}

const ApiDoc = ({ spec }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <SwaggerUI spec={spec} />
}

export default ApiDoc
