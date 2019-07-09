import React from 'react'
import PropTypes from 'prop-types'
import { Link, Redirect } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import { compose } from 'react-apollo'
import { createFlag, removeFlag } from './queries'

import { markdown, useIntl } from 'services'

import NotFound from 'scenes/NotFound'

import { Button, Flags, Tags } from 'components'
import Card, { CardTitle, CardText } from 'components/Card'
import Dropdown, { DropdownItem } from 'components/Dropdown'

import { ActionMenu } from '../../components'
import { FlagsDropdown, Sources, Meta, Share, History } from './components'

const Read = ({ history, match, zNode, createFlag, removeFlag }) => {
  const intl = useIntl(Read)

  if (zNode === null) {
    return <NotFound />
  }

  /* Redirect to correct URL if old slug used */
  const correctSlug = zNode.question.slug + '-' + zNode.id
  if (match.params.slug !== correctSlug) {
    return <Redirect to={'/q/' + correctSlug} />
  }

  return (
    <div>
      <Helmet>
        <title>FAQ - {markdown.title(zNode.question.title)}</title>
        <meta property="og:description" content={markdown.title(zNode.question.title)} />
      </Helmet>
      <ActionMenu backLink="/" backLabel={intl('menu.home')} goBack>
        <FlagsDropdown
          flags={zNode.flags}
          onSelect={type => createFlag(type, zNode.id)}
          onRemove={type => removeFlag(type, zNode.id)}
        />
        <Dropdown button={<Button icon="edit" label={intl('menu.edit.label')} link />}>
          <DropdownItem icon="edit" onClick={() => history.push(`/q/${match.params.slug}/edit`)}>
            {intl('menu.edit.question')}
          </DropdownItem>
          <DropdownItem
            icon="question_answer"
            onClick={() => history.push(`/q/${match.params.slug}/answer`)}
          >
            {intl('menu.edit.answer')}
          </DropdownItem>
        </Dropdown>
      </ActionMenu>
      <Card>
        <CardTitle style={{ padding: '1.2rem' }}>
          <div className="grow">
            <h1>{markdown.title(zNode.question.title)}</h1>
            {zNode.tags.length > 0 && <Tags tags={zNode.tags} />}
          </div>
          <Flags node={zNode} withLabels={true} />
          <Share node={zNode} />
        </CardTitle>
        <CardText>
          {zNode.answer ? (
            <>
              <div style={{ padding: '0.5rem', marginBottom: '0.5rem' }}>
                {markdown.html(zNode.answer.content)}
              </div>
              <Sources sources={zNode.answer.sources} />
            </>
          ) : (
            <div
              style={{
                textAlign: 'center',
                marginTop: '2rem',
                marginBottom: '2rem'
              }}
            >
              <b>{intl('no_answer')}</b>
              <br />
              <br />
              <Link to={`/q/${match.params.slug}/answer`} className="btn-container">
                <Button icon="question_answer" primary>
                  {intl('answer')}
                </Button>
              </Link>
            </div>
          )}
          <hr />
          <Meta node={zNode} />
          <History />
        </CardText>
      </Card>
    </div>
  )
}

Read.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  zNode: PropTypes.object.isRequired,
  createFlag: PropTypes.func.isRequired,
  removeFlag: PropTypes.func.isRequired
}

Read.translations = {
  en: {
    menu: {
      home: 'Home',
      edit: {
        label: 'Edit ...',
        question: 'Question',
        answer: 'Answer'
      }
    },
    no_answer: 'No answer yet...',
    answer: 'Answer the question'
  },
  fr: {
    menu: {
      home: 'Accueil',
      edit: {
        label: 'Modifier ...',
        question: 'Question',
        answer: 'Réponse'
      }
    },
    no_answer: 'Pas encore de réponse...',
    answer: 'Répondre à la question'
  }
}

export default compose(
  createFlag,
  removeFlag
)(Read)
